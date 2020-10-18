// This module contains the wrappers for user's code in each lesson.

export const FULL_DEMO_CODE = `// This code sends a request to a name server 1.2.3.4 and returns the resulting IP address.

// When you click the Resolve button, the code here is executed and you
// can see both how the message travels on the network and how it looks
// internally.

// Don't worry if you don't understand the code or networking details yet—
// we'll go over it step-by-step on the following pages. But you can try
// changing it; see if the result changes too!

const DOMAIN_NAME_REQUEST: &[u8] = b"Alice";
const DNS_SERVER: &str = "1.2.3.4:53"; // address of the DNS server

let socket = UdpSocket::bind("10.0.0.1:1000").expect("couldn't bind to address");
socket
    .send_to(DOMAIN_NAME_REQUEST, DNS_SERVER)
    .expect("couldn't send message");

let mut response_data_buffer = [0u8; 4];
let (size, sender) = socket
    .recv_from(&mut response_data_buffer)
    .expect("failed to receive data");

let ip_address = IpAddr::V4(Ipv4Addr::from(response_data_buffer));

return Ok(ip_address);`;

const IP_HEADER_CODE = `// An IP packet can be divided into two parts: a header and a payload.
// The header is where we put a destination IP address, our own address (also
// known as the source address), and some more helpful information.

// An IP packet is just a sequence of 20 bytes.
// Let's allocate an array to store our header:
let mut header_data = [0u8; 20];

// Each group of bytes in the header means something, but it would have been
// inconvenient to always remember that, for example, \`header_data[3..4]\`
// should be interpreted as the packet size. In order to simplify this, we
// use an \`Ipv4Packet\` structure which implements helper functions to work
// with individual components of the header. We wrap the packet header data
// into this structure:
let mut ip_packet = Ipv4Packet::new(header_data);

// First, let's construct our own IP address and then put it into the header
// as the source address.

// IP addresses are also encoded as numbers: each component of an address is
// represented by a single unsigned byte (a number between 0 and 255).
// As a result, an address like \`10.0.0.1\` will be represented by
// 4 bytes \`[10, 0, 0, 1]\`, which also can be encoded as a single large
// 32-bit number: 167772161.

// We use a helper type from the Rust standard library, \`Ipv4Addr\`, which can
// be constructed with \`Ipv4Addr::new\` - we put the address component bytes as
// arguments, and this function does everything for us, constructing a valid
// IP address. 
let our_own_address = Ipv4Addr::new(10, 0, 0, 1);

// Finally, we can add the source address to the header:
ip_packet.set_src_addr(our_own_address);

// Now let's do the same thing with the destination address
// (1.2.3.4 is the IP address of the name server):
let name_server_address = Ipv4Addr::new(1, 2, 3, 4);
ip_packet.set_dst_addr(name_server_address);

// One header field that is particularly interesting to us is the protocol
// identifier. It tells how the message payload should be interpreted by the
// receiver. In this case, our packet payload uses UDP, which is identified by
// the number 17.
ip_packet.set_protocol(Protocol::Udp);

// Now we also need to add some meta-information to the packet
// First thing is the IP protocol version. Currently, there are two versions in
// use on the Internet, versions 4 and 6. In this lesson, we have been working
// with the version 4 only, so let's use it:
ip_packet.set_version(4);

// We also need to provide the size of the header (which we know is 20 bytes).
ip_packet.set_header_len(20);

// and the total size of the packet, which equals to the length of the header
// plus the length of the payload (data that the packet carries). We don't have
// any payload for now, so the total length will be also equal to 20 bytes.
ip_packet.set_total_len(20);

// Finally, we need to add a checksum to our packet. The receiver of the packet
// checks it to make sure that the packet contents have not been damaged (which
// can happen if you have a flaky Internet connection, for example).

// If you are interested in learning more about the actual algorithm used for
// checksum calculation, you can find it here:
// https://en.wikipedia.org/wiki/IPv4_header_checksum

ip_packet.fill_checksum();

// We can skip other header fields for now (we will cover them in the following
// lessons), but if you want to play with \`Ipv4Packet\`, you can find
// documentation for other available methods here:
// https://docs.rs/smoltcp/0.6.0/smoltcp/wire/struct.Ipv4Packet.html

return Ok(ip_packet.into_inner());
`;

const UDP_HEADER_CODE = `// Let's start by constructing source and destination IP addresses.
let our_own_address = Ipv4Addr::new(10, 0, 0, 1);
let name_server_address = Ipv4Addr::new(1, 2, 3, 4);

// We construct a UDP datagram in a similar way.
// Let's allocate an array of 8 bytes to hold the header data:
let udp_header_data = [0u8; 8];

// And wrap it in the \`UdpDatagram\` helper structure:
let mut udp_packet = UdpDatagram::new(udp_header_data);

// Let's set the source port number.
// It will be used by the receiver to send a response. That is, if your program
// uses port number 1000, and if you send a request to the name server on port
// number 53, it will send a response to the port number 1000.
udp_packet.set_src_port(1000);

// Set the destination port number. We use 53 for a name server port.
udp_packet.set_dst_port(53);

// We also need to set a total size of the UDP datagram (the combined
// length of a header and a payload). We don't send any data yet, and
// we know that the header size is 8 bytes:
udp_packet.set_len(8);

// Lastly, the UDP header also contains its own checksum.
// Why do we need another one if we have already calculated the checksum
// for our IP packet? Remember that the checksum we calculated before
// includes data only for the _IP header_, but not for its payload.
// The checksum we calculate for UDP covers  some fields of a (pseudo)
// _IP header_ and the entirety of the UDP Header and Data.

// If you are interested in learning more about the actual algorithm used for
// checksum calculation, you can find it here:
// https://en.wikipedia.org/wiki/User_Datagram_Protocol#Checksum_computation

udp_packet.fill_checksum(&our_own_address, &name_server_address);

// That's all we have to do for UDP!
// Now let's construct an IP header which will include our UDP datagram.
// This part of the code is almost the same as in the previous example.
// The main difference is in the IP packet size: now that we have a
// payload, the UDP datagram header, we need to add 8 bytes to the
// total packet size.

let mut ip_data = [0u8; 20 + 8]; // IP header size (20) + UDP datagram size (8)
let mut ip_packet = Ipv4Packet::new(ip_data);

ip_packet.set_version(4);
ip_packet.set_protocol(Protocol::Udp);
ip_packet.set_header_len(20);
ip_packet.set_total_len(20 + 8); // IP header size (20) + UDP datagram size (8)
ip_packet.set_src_addr(our_own_address);
ip_packet.set_dst_addr(name_server_address);

// Lastly, let's add our UDP datagram as the payload:
ip_packet
    .payload_mut()
    .copy_from_slice(&udp_packet.into_inner());

// And calculate a checksum for our IP packet:
ip_packet.fill_checksum();

// And we're done!

return Ok(ip_packet.into_inner());
`;

const UDP_API_CODE = `// We construct a socket by _binding_ to our IP address, 10.0.0.1
// and using the port number 1000.
let socket = UdpSocket::bind("10.0.0.1:1000").expect("couldn't bind to address");

// Now we can use the \`send_to\` function which will construct UDP datagrams and
// IP packets for us, including all required header fields and checksums.
// We are sending a request to the name server with the address "1.2.3.4:53".
// It will respond with Alice's IP address.
socket
    .send_to(b"Alice", "1.2.3.4:53")
    .expect("couldn't send message");

// Now we can wait for a response from the name server.
// We allocate an array to hold this response. Because we know it's only an IP
// address, we need 4 bytes to hold it.
let mut response_data_buffer = [0u8; 4];
socket
    .recv_from(&mut response_data_buffer)
    .expect("failed to receive data");

// Let's decode the response as an IP address.
// We have used a similar function before (\`Ipv4Addr::new\`) to
// construct an IP address out of four indidivual bytes. This is
// the same thing, but instead of 4 separate numbers, we just
// use an array of 4 numbers we have got as a response from the
// name server.
let ip_address = IpAddr::V4(Ipv4Addr::from(response_data_buffer));

// And we're done - just return the resulting IP address:
return Ok(ip_address);`;

const FINAL_TEST_CODE = `// Write your code here.

// You need to send a request to a name server to get the IP address of \`Alice\`,
// then send any message to \`Alice\` (use the port number 1000), and finally
// return a message that Alice has sent to you in response.

let mut message_from_alice = [0u8; 1024];

return Ok(message_from_alice.to_vec());`;

export const initDefaultLessonState = (state) => {
    state.playgrounds.fullDemo.code.default = FULL_DEMO_CODE
    state.playgrounds.fullDemo.code.current = FULL_DEMO_CODE;

    state.playgrounds.ipPackets.code.default = IP_HEADER_CODE;
    state.playgrounds.ipPackets.code.current = IP_HEADER_CODE;

    state.playgrounds.udpDatagram.code.default = UDP_HEADER_CODE;
    state.playgrounds.udpDatagram.code.current = UDP_HEADER_CODE;

    state.playgrounds.udpApi.code.default = UDP_API_CODE;
    state.playgrounds.udpApi.code.current = UDP_API_CODE;

    state.playgrounds.finalTest.code.default = FINAL_TEST_CODE;
    state.playgrounds.finalTest.code.current = FINAL_TEST_CODE;
};

const countLines = (str) => str.split('\n').length - 1;

// Tag for templates which calculates line offsets for user code.
// TODO: ideally, this should be a const fn, or a preprocessor function.
const rust = (strings, code) => {
    const lineOffset = countLines(strings[0]);
    return {
        lineOffset,
        code: `${strings[0]}${code}${strings[1]}`
    };
};

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

const MOD_UDP = `
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

export const wrapIpHeaderCode = (code) => {
    const wrappedCode = rust`
use std::net::{IpAddr, Ipv4Addr};

type Result<T> = std::io::Result<T>;
type Ipv4Packet = ip::Packet<[u8; 20]>;

extern "C" {
    fn report_error(str: *const u8, str_len: usize);
}

fn panic_hook(info: &std::panic::PanicInfo) {
    let msg = info.to_string();
    unsafe { report_error(msg.as_ptr(), msg.len()) };
}

fn code() -> Result<[u8; 20]> {
${code}
}

#[no_mangle]
pub unsafe fn main() -> *const [u8; 20] {
    std::panic::set_hook(Box::new(panic_hook));

    let res = code();
    match res {
        Ok(octets) => {
            // We don't care about leaking memory here - this fn will be executed just once.
            let octets = Box::new(octets);
            return Box::into_raw(octets);
        },
        Err(e) => {
            let msg = format!("Error: {}", e);
            report_error(msg.as_ptr(), msg.len());
        }
    }

    return std::ptr::null();
}
`

    // TODO: do something better
    wrappedCode.code = MOD_IP + wrappedCode.code;
    wrappedCode.lineOffset = countLines(MOD_IP) + wrappedCode.lineOffset;

    return wrappedCode;
};

export const wrapUdpHeaderCode = (code) => {
    const wrappedCode = rust`
use std::net::{IpAddr, Ipv4Addr};
type Result<T> = std::io::Result<T>;
type Ipv4Packet = ip::Packet<[u8; 28]>;
type UdpDatagram = udp::Packet<[u8; 8]>;

extern "C" {
    fn report_error(str: *const u8, str_len: usize);
}

fn panic_hook(info: &std::panic::PanicInfo) {
    let msg = info.to_string();
    unsafe { report_error(msg.as_ptr(), msg.len()) };
}

fn code() -> Result<[u8; 28]> {
${code}
}

#[no_mangle]
pub unsafe fn main() -> *const [u8; 28] {
    std::panic::set_hook(Box::new(panic_hook));

    let res = code();
    match res {
        Ok(octets) => {
            // We don't care about leaking memory here - this fn will be executed just once.
            let octets = Box::new(octets);
            return Box::into_raw(octets);
        },
        Err(e) => {
            let msg = format!("Error: {}", e);
            report_error(msg.as_ptr(), msg.len());
        }
    }

    return std::ptr::null();
}
`;

    wrappedCode.code = MOD_IP + MOD_UDP + wrappedCode.code;
    wrappedCode.lineOffset = countLines(MOD_IP) + countLines(MOD_UDP) + wrappedCode.lineOffset;

    return wrappedCode;
};

const MOD_UDP_SOCKET = `
extern "C" {
    fn udp_bind(ip: u32, port: u16) -> usize;
    fn udp_unbind(socket: usize);
    fn udp_send_to(sock: usize, buf: *const u8, buf_len: u16, dst_ip: u32, dst_port: u16);
    fn udp_recv_from(sock: usize, buf: *mut u8, buf_len: u16, src_ip: *mut u32, src_port: *mut u16) -> u16;
    fn poll_network();
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
`;

export const wrapFullDemoCode = (code) => {
    const wrappedCode = rust`
use std::net::{SocketAddr, SocketAddrV4, IpAddr, Ipv4Addr, ToSocketAddrs};
use std::io::{Result, ErrorKind};

extern "C" {
    fn report_error(str: *const u8, str_len: usize);
}

fn panic_hook(info: &std::panic::PanicInfo) {
    let msg = info.to_string();
    unsafe { report_error(msg.as_ptr(), msg.len()) };
}

fn code() -> Result<IpAddr> {
${code}
}

#[no_mangle]
pub unsafe fn main() -> [u8; 4] {
    std::panic::set_hook(Box::new(panic_hook));
    let res = code();

    // make sure all packets are processed
    let mut polls = 0;
    while polls < 5 {
        poll_network();
        polls += 1;
    }

    match res {
        Ok(IpAddr::V4(ip_addr)) => {
            return ip_addr.octets();
        },
        Ok(res) => {
            let msg = format!("Unexpected result: {:?}", res);
            report_error(msg.as_ptr(), msg.len());
        }
        Err(e) => {
            let msg = format!("Error: {}", e);
            report_error(msg.as_ptr(), msg.len());
        }
    }

    return [0, 0, 0, 0];
}
`;
    wrappedCode.code = MOD_UDP_SOCKET + wrappedCode.code;
    wrappedCode.lineOffset = countLines(MOD_UDP_SOCKET) + wrappedCode.lineOffset;
    return wrappedCode;
}

export const wrapFinalTestCode = (code) => {
    const wrappedCode = rust`
use std::net::{SocketAddr, SocketAddrV4, IpAddr, Ipv4Addr, ToSocketAddrs};
use std::io::{Result, ErrorKind};

extern "C" {
    fn report_error(str: *const u8, str_len: usize);
}

fn panic_hook(info: &std::panic::PanicInfo) {
    let msg = info.to_string();
    unsafe { report_error(msg.as_ptr(), msg.len()) };
}

fn code() -> Result<Vec<u8>> {
${code}
}

#[no_mangle]
pub unsafe fn main() -> usize {
    std::panic::set_hook(Box::new(panic_hook));
    let res = code();

    // make sure all packets are processed
    let mut polls = 0;
    while polls < 5 {
        poll_network();
        polls += 1;
    }

    match res {
        Ok(vec) => {
            // put vec ptr + vec len into a box
            let vec_ptr = Box::into_raw(vec.into_boxed_slice());
            return Box::into_raw(Box::new(vec_ptr)) as usize;
        },
        Ok(res) => {
            let msg = format!("Unexpected result: {:?}", res);
            report_error(msg.as_ptr(), msg.len());
        }
        Err(e) => {
            let msg = format!("Error: {}", e);
            report_error(msg.as_ptr(), msg.len());
        }
    }
    return 0;
}
`;
    wrappedCode.code = MOD_UDP_SOCKET + wrappedCode.code;
    wrappedCode.lineOffset = countLines(MOD_UDP_SOCKET) + wrappedCode.lineOffset;
    return wrappedCode;

};
