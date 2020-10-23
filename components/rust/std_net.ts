// Wrapper for `std::net::UdpSocket`
export const MOD_UDP_SOCKET = `
pub use socket_api::*;

mod socket_api {

use std::net::{SocketAddr, SocketAddrV4, IpAddr, Ipv4Addr, ToSocketAddrs};
use std::io::{Result, ErrorKind};
    
extern "C" {
    fn udp_bind(ip: u32, port: u16) -> usize;
    fn udp_unbind(socket: usize);
    fn udp_send_to(sock: usize, buf: *const u8, buf_len: u16, dst_ip: u32, dst_port: u16);
    fn udp_recv_from(sock: usize, buf: *mut u8, buf_len: u16, src_ip: *mut u32, src_port: *mut u16) -> u16;
    pub fn poll_network();
}

pub struct UdpSocket {
    socket: usize,
    bound_to: SocketAddrV4,
    connected_to: Option<SocketAddr>,
}

impl UdpSocket {
    pub fn bind<A: ToSocketAddrs>(addr: A) -> Result<UdpSocket> {
        let bound_to = match addr.to_socket_addrs().map_err(|e| {
            match e.kind() {
            ErrorKind::Other => {
                // this is most likely due to a resolve_socket_addr failure which is not implemented for wasm
                std::io::Error::new(ErrorKind::InvalidInput, "invalid address format")
            }
            _ => e
            }
        })?.next() {
            Some(SocketAddr::V4(sa)) => sa,
            Some(SocketAddr::V6(..)) => return Err(std::io::Error::new(ErrorKind::InvalidInput, "IPv6 is unsupported :)")),
            None => return Err(std::io::Error::new(ErrorKind::InvalidInput, "no addresses to send data to")),
        };

        let socket = unsafe { udp_bind((*bound_to.ip()).into(), bound_to.port()) };

        Ok(UdpSocket {
            socket,
            bound_to,
            connected_to: None,
        })
    }

    pub fn connect<A: ToSocketAddrs>(&mut self, addr: A) -> Result<()> {
        self.connected_to = addr.to_socket_addrs()?.next();
        Ok(())
    }

    pub fn send(&self, buf: &[u8]) -> Result<usize> {
        if let Some(addr) = self.connected_to {
            self.send_to(buf, addr)
        } else {
            Err(std::io::Error::new(ErrorKind::NotConnected, "Destination address required"))
        }
    }

    pub fn send_to<A: ToSocketAddrs>(&self, buf: &[u8], addr: A) -> Result<usize> {
        if buf.len() + 42 > u16::MAX as usize {
            return Err(std::io::Error::new(ErrorKind::InvalidInput, "packet is too large"));
        }
        let addr = addr.to_socket_addrs()?.next();
        match addr {
            Some(SocketAddr::V4(dst_sa)) => unsafe {
                udp_send_to(
                    self.socket,
                    buf.as_ptr(),
                    buf.len() as u16,
                    (*dst_sa.ip()).into(),
                    dst_sa.port(),
                );
                poll_network();
            },
            Some(SocketAddr::V6(..)) => return Err(std::io::Error::new(ErrorKind::InvalidInput, "IPv6 is unsupported :)")),
            None => return Err(std::io::Error::new(ErrorKind::InvalidInput, "no addresses to send data to")),
        }
        Ok(0)
    }

    pub fn recv(&self, buf: &mut [u8]) -> Result<usize> {
        if let Some(conn_to) = self.connected_to {
            let mut polls = 0;
            loop {
                unsafe {
                    poll_network(); // see if there are any new packets
                }
    
                let mut src_ip: u32 = 0;
                let mut src_port: u16 = 0;
                let recv_size = unsafe {
                    udp_recv_from(self.socket, buf.as_mut_ptr(), buf.len() as u16, &mut src_ip, &mut src_port)
                };
    
                if recv_size > 0 {
                    let sa = SocketAddr::new(IpAddr::V4(Ipv4Addr::from(src_ip.to_be_bytes())), src_port);
                    if conn_to == sa {
                        return Ok(recv_size as usize);
                    }
                    // if it's a message from someone we don't expect, just skip it
                }
    
                polls += 1;
                if polls > 100 { // todo: use binaryen asyncify instead
                    return Err(std::io::Error::new(ErrorKind::WouldBlock, "receive timeout"));
                }
            }
        } else {
            Err(std::io::Error::new(ErrorKind::NotConnected, "Not connected"))
        }
    }

    pub fn recv_from(&self, buf: &mut [u8]) -> Result<(usize, SocketAddr)> {
        let mut polls = 0;
        loop {
            unsafe {
                poll_network(); // see if there are any new packets
            }

            let mut src_ip: u32 = 0;
            let mut src_port: u16 = 0;
            let recv_size = unsafe {
                udp_recv_from(self.socket, buf.as_mut_ptr(), buf.len() as u16, &mut src_ip, &mut src_port)
            };

            if recv_size > 0 {
                let sa = SocketAddr::new(IpAddr::V4(Ipv4Addr::from(src_ip.to_be_bytes())), src_port);
                return Ok((recv_size as usize, sa));
            }

            polls += 1;
            if polls > 100 { // todo: use binaryen asyncify instead
                return Err(std::io::Error::new(ErrorKind::WouldBlock, "receive timeout"));
            }
        }
    }

    pub fn peek(&self, _buf: &mut [u8]) -> Result<usize> {
        Err(std::io::Error::new(ErrorKind::Other, "Not implemented"))
    }

    pub fn peek_from(&self, _buf: &mut [u8]) -> Result<(usize, SocketAddr)> {
        Err(std::io::Error::new(ErrorKind::Other, "Not implemented"))
    }

    pub fn local_addr(&self) -> Result<SocketAddr> {
        Ok(SocketAddr::V4(self.bound_to))
    }
}
}
`;

export const MOD_UDP = `
mod udp {
    use super::ip::{NetworkEndian, Protocol as IpProtocol};
    use std::io::ErrorKind;
    use std::net::Ipv4Addr;

    type Result<T> = std::io::Result<T>;

    #[derive(Debug, PartialEq, Clone)]
    pub struct Packet<T: AsRef<[u8]>> {
        buffer: T,
    }

    mod field {
        #![allow(non_snake_case)]

        pub type Field = ::std::ops::Range<usize>;

        pub const SRC_PORT: Field = 0..2;
        pub const DST_PORT: Field = 2..4;
        pub const LENGTH: Field = 4..6;
        pub const CHECKSUM: Field = 6..8;

        pub fn PAYLOAD(length: u16) -> Field {
            CHECKSUM.end..(length as usize)
        }
    }

    impl<T: AsRef<[u8]>> Packet<T> {
        pub fn new(buffer: T) -> Packet<T> {
            Packet { buffer }
        }

        pub fn new_checked(buffer: T) -> Result<Packet<T>> {
            let packet = Self::new(buffer);
            packet.check_len()?;
            Ok(packet)
        }

        pub fn check_len(&self) -> Result<()> {
            let buffer_len = self.buffer.as_ref().len();
            if buffer_len < field::CHECKSUM.end {
                Err(std::io::Error::new(ErrorKind::Other, "Truncated"))
            } else {
                let field_len = self.len() as usize;
                if buffer_len < field_len {
                    Err(std::io::Error::new(ErrorKind::Other, "Truncated"))
                } else if field_len < field::CHECKSUM.end {
                    Err(std::io::Error::new(ErrorKind::Other, "Malformed"))
                } else {
                    Ok(())
                }
            }
        }

        pub fn into_inner(self) -> T {
            self.buffer
        }

        #[inline]
        pub fn src_port(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::SRC_PORT])
        }

        #[inline]
        pub fn dst_port(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::DST_PORT])
        }

        #[inline]
        pub fn len(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::LENGTH])
        }

        #[inline]
        pub fn checksum(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::CHECKSUM])
        }

        pub fn verify_checksum(&self, src_addr: &Ipv4Addr, dst_addr: &Ipv4Addr) -> bool {
            let data = self.buffer.as_ref();
            super::ip::checksum::combine(&[
                super::ip::checksum::pseudo_header(
                    src_addr,
                    dst_addr,
                    IpProtocol::Udp,
                    self.len() as u32,
                ),
                super::ip::checksum::data(&data[..self.len() as usize]),
            ]) == !0
        }
    }

    impl<'a, T: AsRef<[u8]> + ?Sized> Packet<&'a T> {
        #[inline]
        pub fn payload(&self) -> &'a [u8] {
            let length = self.len();
            let data = self.buffer.as_ref();
            &data[field::PAYLOAD(length)]
        }
    }

    impl<T: AsRef<[u8]> + AsMut<[u8]>> Packet<T> {
        #[inline]
        pub fn set_src_port(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::SRC_PORT], value)
        }

        #[inline]
        pub fn set_dst_port(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::DST_PORT], value)
        }

        #[inline]
        pub fn set_len(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::LENGTH], value)
        }

        #[inline]
        pub fn set_checksum(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::CHECKSUM], value)
        }

        pub fn fill_checksum(&mut self, src_addr: &Ipv4Addr, dst_addr: &Ipv4Addr) {
            self.set_checksum(0);
            let checksum = {
                let data = self.buffer.as_ref();
                !super::ip::checksum::combine(&[
                    super::ip::checksum::pseudo_header(
                        src_addr,
                        dst_addr,
                        IpProtocol::Udp,
                        self.len() as u32,
                    ),
                    super::ip::checksum::data(&data[..self.len() as usize]),
                ])
            };
            self.set_checksum(if checksum == 0 { 0xffff } else { checksum })
        }

        #[inline]
        pub fn payload_mut(&mut self) -> &mut [u8] {
            let length = self.len();
            let data = self.buffer.as_mut();
            &mut data[field::PAYLOAD(length)]
        }
    }

    impl<T: AsRef<[u8]>> AsRef<[u8]> for Packet<T> {
        fn as_ref(&self) -> &[u8] {
            self.buffer.as_ref()
        }
    }
}

`;

export const MOD_IP = `
use ip::Protocol;

mod ip {
    use std::convert::TryInto;
    use std::io::ErrorKind;
    use std::net::{IpAddr, Ipv4Addr};

    type Result<T> = std::io::Result<T>;

    pub mod checksum {
        use super::*;
    
        fn propagate_carries(word: u32) -> u16 {
            let sum = (word >> 16) + (word & 0xffff);
            ((sum >> 16) as u16) + (sum as u16)
        }
    
        /// Compute an RFC 1071 compliant checksum (without the final complement).
        pub fn data(mut data: &[u8]) -> u16 {
            let mut accum = 0;
    
            // For each 32-byte chunk...
            const CHUNK_SIZE: usize = 32;
            while data.len() >= CHUNK_SIZE {
                let mut d = &data[..CHUNK_SIZE];
                // ... take by 2 bytes and sum them.
                while d.len() >= 2 {
                    accum += NetworkEndian::read_u16(d) as u32;
                    d = &d[2..];
                }
    
                data = &data[CHUNK_SIZE..];
            }
    
            // Sum the rest that does not fit the last 32-byte chunk,
            // taking by 2 bytes.
            while data.len() >= 2 {
                accum += NetworkEndian::read_u16(data) as u32;
                data = &data[2..];
            }
    
            // Add the last remaining odd byte, if any.
            if let Some(&value) = data.first() {
                accum += (value as u32) << 8;
            }
    
            propagate_carries(accum)
        }

        pub fn combine(checksums: &[u16]) -> u16 {
            let mut accum: u32 = 0;
            for &word in checksums {
                accum += word as u32;
            }
            propagate_carries(accum)
        }

        pub fn pseudo_header(
            src_addr: &Ipv4Addr,
            dst_addr: &Ipv4Addr,
            protocol: Protocol,
            length: u32,
        ) -> u16 {
            let mut proto_len = [0u8; 4];
            proto_len[1] = protocol.into();
            NetworkEndian::write_u16(&mut proto_len[2..4], length as u16);
    
            combine(&[
                data(&src_addr.octets()),
                data(&dst_addr.octets()),
                data(&proto_len[..]),
            ])
        }
    }

    pub enum Protocol {
        HopByHop,
        Icmp,
        Igmp,
        Tcp,
        Udp,
        Unknown(u8),
    }

    impl From<u8> for Protocol {
        fn from(value: u8) -> Self {
            match value {
                0x00 => Protocol::HopByHop,
                0x01 => Protocol::Icmp,
                0x02 => Protocol::Igmp,
                0x06 => Protocol::Tcp,
                0x11 => Protocol::Udp,
                other => Protocol::Unknown(other),
            }
        }
    }

    impl From<Protocol> for u8 {
        fn from(value: Protocol) -> Self {
            match value {
                Protocol::HopByHop => 0x00,
                Protocol::Icmp => 0x01,
                Protocol::Igmp => 0x02,
                Protocol::Tcp => 0x06,
                Protocol::Udp => 0x11,
                Protocol::Unknown(other) => other,
            }
        }
    }

    pub struct NetworkEndian {}

    impl NetworkEndian {
        pub fn read_u16(input: &[u8]) -> u16 {
            let (int_bytes, rest) = input.split_at(std::mem::size_of::<u16>());
            u16::from_be_bytes(int_bytes.try_into().unwrap())
        }

        pub fn read_u32(input: &[u8]) -> u32 {
            let (int_bytes, rest) = input.split_at(std::mem::size_of::<u32>());
            u32::from_be_bytes(int_bytes.try_into().unwrap())
        }

        pub fn write_u16(input: &mut [u8], value: u16) {
            let bytes = value.to_be_bytes();
            let (int_bytes, rest) = input.split_at_mut(std::mem::size_of::<u16>());
            int_bytes.copy_from_slice(&bytes);
        }

        pub fn write_u32(input: &mut [u8], value: u32) {
            let bytes = value.to_be_bytes();
            let (int_bytes, rest) = input.split_at_mut(std::mem::size_of::<u32>());
            int_bytes.copy_from_slice(&bytes);
        }
    }

    #[derive(Debug, PartialEq, Clone)]
    pub struct Packet<T: AsRef<[u8]>> {
        buffer: T,
    }

    mod field {
        pub type Field = ::std::ops::Range<usize>;
    
        pub const VER_IHL: usize = 0;
        pub const DSCP_ECN: usize = 1;
        pub const LENGTH: Field = 2..4;
        pub const IDENT: Field = 4..6;
        pub const FLG_OFF: Field = 6..8;
        pub const TTL: usize = 8;
        pub const PROTOCOL: usize = 9;
        pub const CHECKSUM: Field = 10..12;
        pub const SRC_ADDR: Field = 12..16;
        pub const DST_ADDR: Field = 16..20;
    }

    impl<T: AsRef<[u8]>> Packet<T> {
        pub fn new(buffer: T) -> Packet<T> {
            Packet { buffer }
        }

        pub fn new_checked(buffer: T) -> Result<Packet<T>> {
            let packet = Self::new(buffer);
            packet.check_len()?;
            Ok(packet)
        }

        pub fn check_len(&self) -> Result<()> {
            let len = self.buffer.as_ref().len();
            if len < field::DST_ADDR.end {
                Err(std::io::Error::new(ErrorKind::Other, "Truncated"))
            } else if len < self.header_len() as usize {
                Err(std::io::Error::new(ErrorKind::Other, "Truncated"))
            } else if self.header_len() as u16 > self.total_len() {
                Err(std::io::Error::new(ErrorKind::Other, "Malformed"))
            } else if len < self.total_len() as usize {
                Err(std::io::Error::new(ErrorKind::Other, "Truncated"))
            } else {
                Ok(())
            }
        }

        pub fn into_inner(self) -> T {
            self.buffer
        }

        #[inline]
        pub fn version(&self) -> u8 {
            let data = self.buffer.as_ref();
            data[field::VER_IHL] >> 4
        }

        #[inline]
        pub fn header_len(&self) -> u8 {
            let data = self.buffer.as_ref();
            (data[field::VER_IHL] & 0x0f) * 4
        }

        pub fn dscp(&self) -> u8 {
            let data = self.buffer.as_ref();
            data[field::DSCP_ECN] >> 2
        }

        pub fn ecn(&self) -> u8 {
            let data = self.buffer.as_ref();
            data[field::DSCP_ECN] & 0x03
        }

        #[inline]
        pub fn total_len(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::LENGTH])
        }

        #[inline]
        pub fn ident(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::IDENT])
        }

        #[inline]
        pub fn dont_frag(&self) -> bool {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::FLG_OFF]) & 0x4000 != 0
        }

        #[inline]
        pub fn more_frags(&self) -> bool {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::FLG_OFF]) & 0x2000 != 0
        }

        #[inline]
        pub fn frag_offset(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::FLG_OFF]) << 3
        }

        #[inline]
        pub fn hop_limit(&self) -> u8 {
            let data = self.buffer.as_ref();
            data[field::TTL]
        }

        #[inline]
        pub fn protocol(&self) -> Protocol {
            let data = self.buffer.as_ref();
            Protocol::from(data[field::PROTOCOL])
        }

        #[inline]
        pub fn checksum(&self) -> u16 {
            let data = self.buffer.as_ref();
            NetworkEndian::read_u16(&data[field::CHECKSUM])
        }

        #[inline]
        pub fn src_addr(&self) -> Ipv4Addr {
            let data = self.buffer.as_ref();
            Ipv4Addr::from(NetworkEndian::read_u32(&data[field::SRC_ADDR]))
        }

        #[inline]
        pub fn dst_addr(&self) -> Ipv4Addr {
            let data = self.buffer.as_ref();
            Ipv4Addr::from(NetworkEndian::read_u32(&data[field::DST_ADDR]))
        }

        pub fn verify_checksum(&self) -> bool {
            if cfg!(fuzzing) {
                return true;
            }
    
            let data = self.buffer.as_ref();
            checksum::data(&data[..self.header_len() as usize]) == !0
        }
    }
    
    impl<'a, T: AsRef<[u8]> + ?Sized> Packet<&'a T> {
        /// Return a pointer to the payload.
        #[inline]
        pub fn payload(&self) -> &'a [u8] {
            let range = self.header_len() as usize..self.total_len() as usize;
            let data = self.buffer.as_ref();
            &data[range]
        }
    }

    impl<T: AsRef<[u8]> + AsMut<[u8]>> Packet<T> {
        #[inline]
        pub fn set_version(&mut self, value: u8) {
            let data = self.buffer.as_mut();
            data[field::VER_IHL] = (data[field::VER_IHL] & !0xf0) | (value << 4);
        }

        #[inline]
        pub fn set_header_len(&mut self, value: u8) {
            let data = self.buffer.as_mut();
            data[field::VER_IHL] = (data[field::VER_IHL] & !0x0f) | ((value / 4) & 0x0f);
        }

        pub fn set_dscp(&mut self, value: u8) {
            let data = self.buffer.as_mut();
            data[field::DSCP_ECN] = (data[field::DSCP_ECN] & !0xfc) | (value << 2)
        }

        pub fn set_ecn(&mut self, value: u8) {
            let data = self.buffer.as_mut();
            data[field::DSCP_ECN] = (data[field::DSCP_ECN] & !0x03) | (value & 0x03)
        }

        #[inline]
        pub fn set_total_len(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::LENGTH], value)
        }

        #[inline]
        pub fn set_ident(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::IDENT], value)
        }

        #[inline]
        pub fn clear_flags(&mut self) {
            let data = self.buffer.as_mut();
            let raw = NetworkEndian::read_u16(&data[field::FLG_OFF]);
            let raw = raw & !0xe000;
            NetworkEndian::write_u16(&mut data[field::FLG_OFF], raw);
        }

        #[inline]
        pub fn set_dont_frag(&mut self, value: bool) {
            let data = self.buffer.as_mut();
            let raw = NetworkEndian::read_u16(&data[field::FLG_OFF]);
            let raw = if value { raw | 0x4000 } else { raw & !0x4000 };
            NetworkEndian::write_u16(&mut data[field::FLG_OFF], raw);
        }

        #[inline]
        pub fn set_more_frags(&mut self, value: bool) {
            let data = self.buffer.as_mut();
            let raw = NetworkEndian::read_u16(&data[field::FLG_OFF]);
            let raw = if value { raw | 0x2000 } else { raw & !0x2000 };
            NetworkEndian::write_u16(&mut data[field::FLG_OFF], raw);
        }

        #[inline]
        pub fn set_frag_offset(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            let raw = NetworkEndian::read_u16(&data[field::FLG_OFF]);
            let raw = (raw & 0xe000) | (value >> 3);
            NetworkEndian::write_u16(&mut data[field::FLG_OFF], raw);
        }

        #[inline]
        pub fn set_hop_limit(&mut self, value: u8) {
            let data = self.buffer.as_mut();
            data[field::TTL] = value
        }

        #[inline]
        pub fn set_protocol(&mut self, value: Protocol) {
            let data = self.buffer.as_mut();
            data[field::PROTOCOL] = value.into()
        }

        #[inline]
        pub fn set_checksum(&mut self, value: u16) {
            let data = self.buffer.as_mut();
            NetworkEndian::write_u16(&mut data[field::CHECKSUM], value)
        }

        #[inline]
        pub fn set_src_addr(&mut self, value: Ipv4Addr) {
            let data = self.buffer.as_mut();
            data[field::SRC_ADDR].copy_from_slice(&value.octets())
        }

        #[inline]
        pub fn set_dst_addr(&mut self, value: Ipv4Addr) {
            let data = self.buffer.as_mut();
            data[field::DST_ADDR].copy_from_slice(&value.octets())
        }

        pub fn fill_checksum(&mut self) {
            self.set_checksum(0);
            let checksum = {
                let data = self.buffer.as_ref();
                !checksum::data(&data[..self.header_len() as usize])
            };
            self.set_checksum(checksum)
        }

        #[inline]
        pub fn payload_mut(&mut self) -> &mut [u8] {
            let range = self.header_len() as usize..self.total_len() as usize;
            let data = self.buffer.as_mut();
            &mut data[range]
        }
    }
    
    impl<T: AsRef<[u8]>> AsRef<[u8]> for Packet<T> {
        fn as_ref(&self) -> &[u8] {
            self.buffer.as_ref()
        }
    }
}

`;
