// This module contains JavaScript functions that are imported in Rust wasm modules.

export const report_error = (userMod) => (str_ptr, str_len) => {
  const errorStrSlice = new Uint8Array(
    userMod.current.exports.memory.buffer
  ).slice(str_ptr, str_ptr + str_len);
  const error = new TextDecoder("utf-8").decode(errorStrSlice);
  throw error;
};
