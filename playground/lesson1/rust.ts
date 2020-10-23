// This module contains the wrappers for user's code in each lesson.

import { MOD_IP, MOD_UDP, MOD_UDP_SOCKET } from "../../components/rust/std_net";

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

// An IP header is just a sequence of 20 bytes.
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
  state.playgrounds.fullDemo.code.default = FULL_DEMO_CODE;
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

const countLines = (str) => str.split("\n").length - 1;

// Tag for templates which calculates line offsets for user code.
// TODO: ideally, this should be a const fn, or a preprocessor function.
const rust = (strings, code) => {
  const lineOffset = countLines(strings[0]);
  return {
    lineOffset,
    code: `${strings[0]}${code}${strings[1]}`,
  };
};

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
`;

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
  wrappedCode.lineOffset =
    countLines(MOD_IP) + countLines(MOD_UDP) + wrappedCode.lineOffset;

  return wrappedCode;
};

export const wrapFullDemoCode = (code) => {
  const wrappedCode = rust`
use std::net::{SocketAddr, SocketAddrV4, IpAddr, Ipv4Addr, ToSocketAddrs};
use std::io::{Result};

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
    for _poll in 0..4 {
        poll_network();
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
};

export const wrapFinalTestCode = (code) => {
  const wrappedCode = rust`
use std::net::{IpAddr, Ipv4Addr};
use std::io::{Result};

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
    for _poll in 0..4 {
        poll_network();
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
