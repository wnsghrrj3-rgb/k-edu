// 릴리스에서는 콘솔 창 없이
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    kmovie_shell_lib::run()
}
