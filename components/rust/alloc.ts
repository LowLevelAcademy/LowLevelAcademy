// Allocation functions
export const MOD_ALLOC = `
#[no_mangle]
pub extern "C" fn __wbindgen_malloc(size: usize) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    if let Ok(layout) = std::alloc::Layout::from_size_align(size, align) {
        unsafe {
            if layout.size() > 0 {
                let ptr = std::alloc::alloc(layout);
                if !ptr.is_null() {
                    return ptr;
                }
            } else {
                return align as *mut u8;
            }
        }
    }

    malloc_failure();
}

/// Reallocate memory in the virtual network module.
#[no_mangle]
pub unsafe extern "C" fn __wbindgen_realloc(
    ptr: *mut u8,
    old_size: usize,
    new_size: usize,
) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    debug_assert!(old_size > 0);
    debug_assert!(new_size > 0);
    if let Ok(layout) = std::alloc::Layout::from_size_align(old_size, align) {
        let ptr = std::alloc::realloc(ptr, layout, new_size);
        if !ptr.is_null() {
            return ptr;
        }
    }
    malloc_failure();
}

#[cold]
fn malloc_failure() -> ! {
    if cfg!(debug_assertions) {
        panic!("invalid malloc request")
    // throw_str("invalid malloc request")
    } else {
        std::process::abort();
    }
}

/// Deallocate memory in the virtual network module.
#[no_mangle]
pub unsafe extern "C" fn __wbindgen_free(ptr: *mut u8, size: usize) {
    // This happens for zero-length slices, and in that case \`ptr\` is
    // likely bogus so don't actually send this to the system allocator
    if size == 0 {
        return;
    }
    let align = std::mem::align_of::<usize>();
    let layout = std::alloc::Layout::from_size_align_unchecked(size, align);
    std::alloc::dealloc(ptr, layout);
}
`;
