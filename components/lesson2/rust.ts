import { selectPlayground } from "../../playground/selectors";
// This module contains the wrappers for user's code in each lesson.

import { MOD_ALLOC } from "../rust/alloc";
import { MOD_UDP_SOCKET } from "../rust/std_net";

export const initDefaultLessonState = (state) => {
  state.playgrounds.colorPlayground.code.default = COLOR_PLAYGROUND_CODE;
  state.playgrounds.colorPlayground.code.current = COLOR_PLAYGROUND_CODE;

  state.playgrounds.chunks.code.default = CHUNKS_CODE;
  state.playgrounds.chunks.code.current = CHUNKS_CODE;

  state.playgrounds.sendChunks.code.default = SEND_CHUNKS_CODE;
  state.playgrounds.sendChunks.code.current = SEND_CHUNKS_CODE;

  state.playgrounds.enumerateChunks.code.default = ENUMERATE_CHUNKS_CODE;
  state.playgrounds.enumerateChunks.code.current = ENUMERATE_CHUNKS_CODE;

  state.playgrounds.reorderChunks.code.default = REORDER_CHUNKS_CODE;
  state.playgrounds.reorderChunks.code.current = REORDER_CHUNKS_CODE;

  state.playgrounds.sendOrderedChunks.code.default = SEND_ORDERED_CHUNKS_CODE;
  state.playgrounds.sendOrderedChunks.code.current = SEND_ORDERED_CHUNKS_CODE;
};

export const COLOR_PLAYGROUND_CODE = `// Each pixel in an image is represented by four bytes:
// red, green, blue, and alpha. \`repr(C, packed)\` sets the alignment of the
// structure: we want it to be of exactly 4 bytes in size.
#[repr(C, packed)]
struct Pixel {
  red: u8,
  green: u8,
  blue: u8,
  alpha: u8, // the alpha channel in an extra color component that sets the opacity
}

// We take an array of pixels as an argument for this function.
// After calling this function, the image contains a different sequence of bytes.
fn transform_image(image: &mut [Pixel]) {
  for pixel in image {
    // Set green and blue components of each pixel to zero.
    pixel.green = 0;
    pixel.blue = 0;
  }
}

// Try modifying this function to see how the image will change!`;

const CHUNKS_CODE = `// Let's limit each chunk by 65000 bytes.
// Try changing this to see if the resulting chunks will be different!
const MAX_PACKET_SIZE: usize = 65000;

type Chunk = Vec<Pixel>;

// This function returns a list of chunks.
// We define each chunk as a list of pixels (\`Vec<Pixel>\`)
fn chunk_image(image: &mut [Pixel]) -> Vec<Chunk> {
  image.chunks(MAX_PACKET_SIZE / 4) // We divide by 4 here because each pixel is encoded with 4 bytes
    .map(|chunk| chunk.to_vec())    // Convert each chunk into a \`Vec<Pixel>\`
    .collect()                      // Return a list of chunks as a result implicitly (notice the lack of semicolon)
}
`;

const SEND_CHUNKS_CODE = `// Alice's address
const ALICE: &str = "10.0.0.42:1000";

// This example uses the \`chunk_image\` function defined above.
//
// It takes the following arguments:
// - \`chunks\` - image chunks that we want to send over the network.
// - \`socket\` - a UDP socket.
fn send_image(chunks: &mut [Chunk], socket: &UdpSocket) {
  for chunk in chunks {
    socket.send_to(&chunk.as_bytes(), ALICE) // \`Chunk.as_bytes\` encodes pixels into bytes
      .expect("Couldn't send data");
  }
}`;

const SEND_ORDERED_CHUNKS_CODE = `// Alice's address
const ALICE: &str = "10.0.0.42:1000";

// This example uses the result from the \`reorder_chunks\` function defined above.
//
// It takes the following arguments:
// - \`chunks\` - a list of ordered chunks.
// - \`socket\` - a UDP socket.
fn send_ordered_chunks(chunks: &mut [(usize, Chunk)], socket: &UdpSocket) {
  for (index, chunk) in chunks {
    // First, let's encode our chunk of pixels as bytes.
    // We allocate memory for it, leaving one extra byte for the chunk index (+ 1)
    let mut bytes = Vec::with_capacity(chunk.len() + 1);

    // The first byte is reserved for the chunk index:
    bytes.push(*index as u8);

    // Add the actual pixel bytes (\`Chunk.as_bytes\` encodes pixels into bytes):
    bytes.extend_from_slice(chunk.as_bytes());

    // Finally, send the resulting chunk to Alice:
    socket.send_to(&bytes, ALICE)
      .expect("Couldn't send data");
  }
}

// While this code does the trick, please bear in mind that it is not efficient.
// We do a lot of unnecessary memory copying just in order to add the chunk index
// in the beginning. In future lessons, we will learn how to use more efficient
// serialization methods.`;

const ENUMERATE_CHUNKS_CODE = `fn enumerate_chunks(chunks: Vec<Chunk>) -> Vec<(usize, Chunk)> {
  chunks.into_iter()
    .enumerate()
    .collect()
}`;

const REORDER_CHUNKS_CODE = `// This function takes an unordered list of chunks as its argument.
// Try commenting out the \`sort_by\` call and see what will change.
fn reorder_chunks(chunks: &mut [(usize, Chunk)]) {
  chunks
    .sort_by(|(index_a, chunk_a), (index_b, chunk_b)| index_a.cmp(&index_b));

  // You can also try to reverse the order:
  // chunks.reverse();
}`;

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

export const wrapColorManipulation = (code) => {
  const wrappedCode = rust`
${code}

extern "C" {
    fn report_error(str: *const u8, str_len: usize);
}

fn panic_hook(info: &std::panic::PanicInfo) {
    let msg = info.to_string();
    unsafe { report_error(msg.as_ptr(), msg.len()) };
}

#[no_mangle]
pub unsafe fn main(image: *mut u8, image_size: usize) {
    std::panic::set_hook(Box::new(panic_hook));
    let mut pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);
    transform_image(pixels);
}
`;
  wrappedCode.code = MOD_ALLOC + wrappedCode.code;
  wrappedCode.lineOffset = countLines(MOD_ALLOC) + wrappedCode.lineOffset;
  return wrappedCode;
};

export const wrapChunks = (code) => {
  const wrappedCode = rust`
  #[repr(C, packed)]
  #[derive(Copy, Clone)]
  struct Pixel {
      red: u8,
      green: u8,
      blue: u8,
      alpha: u8,
  }

  ${code}

  extern "C" {
      fn report_error(str: *const u8, str_len: usize);
  }
  
  fn panic_hook(info: &std::panic::PanicInfo) {
      let msg = info.to_string();
      unsafe { report_error(msg.as_ptr(), msg.len()) };
  }
 
  extern "C" {
      fn import_chunk(offset: usize, chunk_ptr: *const u8, chunk_len: usize, index: usize);
  }

  #[no_mangle]
  pub unsafe fn main(image: *mut u8, image_size: usize, _scramble_seed: u32) {
      std::panic::set_hook(Box::new(panic_hook));

      let mut pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);

      let chunks = chunk_image(pixels);

      let mut offset = 0;
      for chunk in chunks {
          import_chunk(offset, chunk.as_ptr() as *const _, chunk.len() * 4, 0);
          offset += chunk.len() * 4;
      }
  }
  `;
  wrappedCode.code = MOD_ALLOC + wrappedCode.code;
  wrappedCode.lineOffset = countLines(MOD_ALLOC) + wrappedCode.lineOffset;
  return wrappedCode;
};

const MOD_PIXEL = `#[repr(C, packed)]
#[derive(Copy, Clone)]
struct Pixel {
    red: u8,
    green: u8,
    blue: u8,
    alpha: u8,
}

trait AsBytes {
    fn as_bytes(&self) -> &[u8];
}

impl AsBytes for Vec<Pixel> {
    fn as_bytes(&self) -> &[u8] {
        unsafe {
            std::slice::from_raw_parts(
                self.as_ptr() as *const u8,
                self.len() * 4
            )
        }
    }
}`;

export const wrapSendChunks = (code, state) => {
  const chunkFnCode = selectPlayground(state, "chunks").code.current;

  const wrappedCode = rust`
    ${code}
  
    extern "C" {
        fn report_error(str: *const u8, str_len: usize);
        fn import_chunk(offset: usize, chunk_ptr: *const u8, chunk_len: usize, index: usize);
    }
    
    fn panic_hook(info: &std::panic::PanicInfo) {
        let msg = info.to_string();
        unsafe { report_error(msg.as_ptr(), msg.len()) };
    }

    #[no_mangle]
    pub unsafe fn main(image: *mut u8, image_size: usize, scramble_seed: u32) {
        std::panic::set_hook(Box::new(panic_hook));
        let pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);
        let socket = UdpSocket::bind("10.0.0.1:1000").expect("couldn't bind to address");

        let mut chunks = chunk_image(pixels);
        if chunks.len() > 40 {
            panic!("Too many chunks; try setting a higher value for MAX_PACKET_SIZE");
        }

        send_image(&mut chunks, &socket);

        // make sure all packets are processed
        let mut polls = 0;
        for _poll in 0..4 {
            poll_network();
        }

        // Scramble the result
        let mut offset = 0;
        chunks.sort_by(
            |chunk_a, chunk_b|
            (scramble_seed % (chunk_a[0].red as u32)).partial_cmp(&(scramble_seed % (chunk_b[0].green as u32))).unwrap()
        );
        for chunk in chunks {
            import_chunk(offset, chunk.as_ptr() as *const _, chunk.len() * 4, 0);
            offset += chunk.len() * 4;
        }
    }
    `;

  wrappedCode.code =
    MOD_PIXEL + MOD_ALLOC + MOD_UDP_SOCKET + chunkFnCode + wrappedCode.code;

  wrappedCode.lineOffset =
    countLines(MOD_PIXEL) +
    countLines(MOD_ALLOC) +
    countLines(MOD_UDP_SOCKET) +
    countLines(chunkFnCode) +
    wrappedCode.lineOffset;

  return wrappedCode;
};

export const wrapEnumerate = (code, state) => {
  const chunkFnCode = selectPlayground(state, "chunks").code.current;

  const wrappedCode = rust`
  ${code}

  extern "C" {
      fn report_error(str: *const u8, str_len: usize);
  }
  
  fn panic_hook(info: &std::panic::PanicInfo) {
      let msg = info.to_string();
      unsafe { report_error(msg.as_ptr(), msg.len()) };
  }
 
  extern "C" {
      fn import_chunk(offset: usize, chunk_ptr: *const u8, chunk_len: usize, index: usize);
  }

  #[no_mangle]
  pub unsafe fn main(image: *mut u8, image_size: usize, scramble_seed: u32) {
      std::panic::set_hook(Box::new(panic_hook));

      let mut pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);

      let chunks = chunk_image(pixels);
      let mut enumerated_chunks = enumerate_chunks(chunks);

      let mut offset = 0;
      enumerated_chunks.sort_by(
          |(_idx_a, chunk_a), (_idx_b, chunk_b)|
          (scramble_seed % (chunk_a[0].red as u32)).partial_cmp(&(scramble_seed % (chunk_b[0].green as u32))).unwrap()
      );
      for (index, chunk) in enumerated_chunks {
          import_chunk(offset, chunk.as_ptr() as *const _, chunk.len() * 4, index);
          offset += chunk.len() * 4;
      }
  }
  `;
  wrappedCode.code = MOD_PIXEL + MOD_ALLOC + chunkFnCode + wrappedCode.code;
  wrappedCode.lineOffset =
    countLines(MOD_PIXEL) +
    countLines(MOD_ALLOC) +
    countLines(chunkFnCode) +
    wrappedCode.lineOffset;
  return wrappedCode;
};

export const wrapReorderChunks = (code, state) => {
  const chunkFnCode = selectPlayground(state, "chunks").code.current;
  const enumerateFnCode = selectPlayground(state, "enumerateChunks").code
    .current;

  const wrappedCode = rust`
  ${code}

  extern "C" {
      fn report_error(str: *const u8, str_len: usize);
  }
  
  fn panic_hook(info: &std::panic::PanicInfo) {
      let msg = info.to_string();
      unsafe { report_error(msg.as_ptr(), msg.len()) };
  }
 
  extern "C" {
      fn import_chunk(offset: usize, chunk_ptr: *const u8, chunk_len: usize, index: usize);
  }

  #[no_mangle]
  pub unsafe fn main(image: *mut u8, image_size: usize, scramble_seed: u32) {
      std::panic::set_hook(Box::new(panic_hook));

      let mut pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);

      let chunks = chunk_image(pixels);
      let mut enumerated_chunks = enumerate_chunks(chunks);
      reorder_chunks(&mut enumerated_chunks);

      let mut offset = 0;
      for (index, chunk) in enumerated_chunks {
          import_chunk(offset, chunk.as_ptr() as *const _, chunk.len() * 4, index);
          offset += chunk.len() * 4;
      }
  }
  `;
  wrappedCode.code =
    MOD_PIXEL + MOD_ALLOC + chunkFnCode + enumerateFnCode + wrappedCode.code;
  wrappedCode.lineOffset =
    countLines(MOD_PIXEL) +
    countLines(MOD_ALLOC) +
    countLines(enumerateFnCode) +
    countLines(chunkFnCode) +
    wrappedCode.lineOffset;
  return wrappedCode;
};

export const wrapSendOrderedChunks = (code, state) => {
  const chunkFnCode = selectPlayground(state, "chunks").code.current;
  const enumerateFnCode = selectPlayground(state, "enumerateChunks").code
    .current;
  const reorderFnCode = selectPlayground(state, "reorderChunks").code.current;

  const wrappedCode = rust`
    ${code}
  
    extern "C" {
        fn report_error(str: *const u8, str_len: usize);
        fn import_chunk(offset: usize, chunk_ptr: *const u8, chunk_len: usize, index: usize);
    }
    
    fn panic_hook(info: &std::panic::PanicInfo) {
        let msg = info.to_string();
        unsafe { report_error(msg.as_ptr(), msg.len()) };
    }
  
    #[no_mangle]
    pub unsafe fn main(image: *mut u8, image_size: usize, scramble_seed: u32) {
        std::panic::set_hook(Box::new(panic_hook));
        let pixels: &mut [Pixel] = std::slice::from_raw_parts_mut(image as *mut Pixel, image_size);
        let socket = UdpSocket::bind("10.0.0.1:1000").expect("couldn't bind to address");

        let mut chunks = chunk_image(pixels);
        if chunks.len() > 40 {
            panic!("Too many chunks; try setting a higher value for MAX_PACKET_SIZE");
        }

        let mut enumerated_chunks = enumerate_chunks(chunks);
        reorder_chunks(&mut enumerated_chunks);

        send_ordered_chunks(&mut enumerated_chunks, &socket);

        // make sure all packets are processed
        for _poll in 0..4 {
            poll_network();
        }

        let mut offset = 0;
        for (index, chunk) in enumerated_chunks {
            import_chunk(offset, chunk.as_ptr() as *const _, chunk.len() * 4, index);
            offset += chunk.len() * 4;
        }
    }
    `;

  wrappedCode.code =
    MOD_PIXEL +
    MOD_ALLOC +
    MOD_UDP_SOCKET +
    chunkFnCode +
    enumerateFnCode +
    reorderFnCode +
    wrappedCode.code;

  wrappedCode.lineOffset =
    countLines(MOD_PIXEL) +
    countLines(MOD_ALLOC) +
    countLines(MOD_UDP_SOCKET) +
    countLines(chunkFnCode) +
    countLines(enumerateFnCode) +
    countLines(reorderFnCode) +
    wrappedCode.lineOffset;

  return wrappedCode;
};
