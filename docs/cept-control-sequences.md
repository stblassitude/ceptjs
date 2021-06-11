# T/TE 06-01 / ETS 300 072 Control Sequences

The standard is sometimes hard to read, and definitions are spread out over multiple sections. This document tries to summarize all defined control sequences.

In the tables, "references" point to the part, section, and page number in the standard where information on this control function can be found.

Teh column "OK?" indicates whether this sequence is supported in cept.js.

Note that indices are one-based, and are encoded as such, for example in moving the cursor, or when selecting the color look up table in effect.

## Primary Control Function Set C0

The code points are defined in part 1, section 3.2, on page 75. The definitions are mostly in section 2.

| Sequence | Bytes     | Description                                            | References     | OK? |
| -------- | --------- | ------------------------------------------------------ | -------------- | --- |
| APB      | 0x08      | Move cursor left (aka backspace)                       | P1, §2.2, p.49 | ✅  |
| APF      | 0x09      | Move cursor right                                      | P1, §2.2, p.49 | ✅  |
| APD      | 0x0a      | Move cursor down (aka line feed)                       | P1, §2.2, p.49 | ✅  |
| APU      | 0x0b      | Move cursor up                                         | P1, §2.2, p.49 | ✅  |
| CS       | 0x0c      | Clear screen                                           | P1, §2.2, p.49 | ✅  |
| APR      | 0x0d      | Move cursor to beginning of line (aka carriage return) | P1, §2.2, p.49 | ✅  |
| SO       | 0x0e      | Shift Out, activate G2 in 0x20-0x7f                    |                | ✅  |
| SI       | 0x0f      | Shift In, activate G0 in 0x20-7f                       |                | ✅  |
| CON      | 0x11      |                                                        |                |     |
| RPT n    | 0x12 n    | Repeat the last alpha character n-0x40 times           |                | ✅  |
| COF      | 0x14      |                                                        |                |     |
| CAN      | 0x18      | Cancel, fill the rest of the line with spaces          | P1, §2.2, p.49 | ✅  |
| SS2      | 0x19      | Single Shift 2, activate G2 in 0x20-0x7f for one char  |                | ✅  |
| ESC      | 0x1b      | Escape, see below                                      |                | ✅  |
| SS3      | 0x1d      | Single Shift 3, activate G3 in 0x20-0x7f for one char  |                | ✅  |
| APH      | 0x1e      | Move cursor to (1,1)                                   | P1, §2.2, p.49 | ✅  |
| APA x y  | 0x1f x y  | Move cursor to y-0x40, x-0x40                          | P1, §2.2, p.49 | ✅  |
| US ...   | 0x1f ...  | See VPCE below                                         |                | ✅  |
| ...      | 0x20-0x7e | Print character as per selected set                    |                | ✅  |
| DEL      | 0x7f      | Print DEL char (alpha) or all-foreground (mosaic)      |                |     |
|          | 0x80-0x9f | C1 set, see below                                      |                | ✅  |
| ...      | 0xa0-0xff | Print character as per selected set                    |                | ✅  |


## The Serial Supplementary Control Function Set C1

These sequences set colors and attributes in serial mode. There are two ways in which they can be invoked: Directly from the upper control character range (0x80-0x9f), or through ESC x, where x is 0x40-0x5f.

Serial attributes apply to the current position and all others to the right on the current row, or until the next marker.

You switch between the serial and the parallel C1 set with `ESC 0x22 0x40` (serial) and `ESC 0x22 0x41` (parallel).

Colors are from the current Color Lookup Table (CLUT), see XXX below.

The code points are defined in Part 1, §3.3.1, page 77. For descriptions of the effects of these controls, see Part 1, §1.3, page 8ff, and the reference in the table.


| Sequence | Bytes            | Description                                           | References        | OK? |
| -------- | ---------------- | ----------------------------------------------------- | ----------------- | --- |
| ABK      | 0x80 / 0x1b 0x40 | Select alpha repertory and black (1) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANR      | 0x81 / 0x1b 0x41 | Select alpha repertory and red (2) foreground         | P1, §2.3.1b, p.53 | ✅  |
| ANG      | 0x82 / 0x1b 0x42 | Select alpha repertory and green (3) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANY      | 0x83 / 0x1b 0x43 | Select alpha repertory and yellow (4) foreground      | P1, §2.3.1b, p.53 | ✅  |
| ANB      | 0x84 / 0x1b 0x44 | Select alpha repertory and blue (5) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANM      | 0x85 / 0x1b 0x45 | Select alpha repertory and magenta (6) foreground     | P1, §2.3.1b, p.53 | ✅  |
| ANC      | 0x86 / 0x1b 0x46 | Select alpha repertory and cyan (7) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANW      | 0x87 / 0x1b 0x47 | Select alpha repertory and white (8) foreground       | P1, §2.3.1b, p.53 | ✅  |
| FSH      | 0x88 / 0x1b 0x48 | Enable flash                                          | P1, §2.3.5, p.60  | ✅  |
| STD      | 0x89 / 0x1b 0x49 | Disable flash (steady)                                | P1, §2.3.5, p.60  | ✅  |
| EBX      | 0x8a / 0x1b 0x4a | Enable window/box                                     | P1, §2.3.8, p.63  | ✅  |
| SBX      | 0x8b / 0x1b 0x4b | Stop window/box                                       | P1, §2.3.8, p.63  | ✅  |
| NSZ      | 0x8c / 0x1b 0x4c | Normal size                                           | P1, §2.3.4, p.59  | ✅  |
| DBH      | 0x8d / 0x1b 0x4d | Double height                                         | P1, §2.3.4, p.59  | ✅  |
| DBW      | 0x8e / 0x1b 0x4e | Double width                                          | P1, §2.3.4, p.59  | ✅  |
| DBS      | 0x8f / 0x1b 0x4f | Double size                                           | P1, §2.3.4, p.59  | ✅  |
| MBK      | 0x90 / 0x1b 0x50 | Select mosaic repertory and black (1) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSR      | 0x91 / 0x1b 0x51 | Select mosaic repertory and red (2) foreground        | P1, §2.3.1b, p.54 | ✅  |
| MSG      | 0x92 / 0x1b 0x52 | Select mosaic repertory and green (3) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSY      | 0x93 / 0x1b 0x53 | Select mosaic repertory and yellow (4) foreground     | P1, §2.3.1b, p.54 | ✅  |
| MSB      | 0x94 / 0x1b 0x54 | Select mosaic repertory and blue (5) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSM      | 0x95 / 0x1b 0x55 | Select mosaic repertory and magenta (6) foreground    | P1, §2.3.1b, p.54 | ✅  |
| MSC      | 0x96 / 0x1b 0x56 | Select mosaic repertory and cyan (7) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSW      | 0x97 / 0x1b 0x57 | Select mosaic repertory and white (8) foreground      | P1, §2.3.1b, p.54 | ✅  |
| CDY      | 0x98 / 0x1b 0x58 | Conceal display; stop conceal is `CSI 4/2`            | P1, §2.3.6, p.62  | ✅  |
| SPL      | 0x99 / 0x1b 0x59 | Stop lining                                           | P1, §2.3.3, p.59  | ✅  |
| STL      | 0x9a / 0x1b 0x5a | Start lining                                          | P1, §2.3.3, p.59  | ✅  |
| CSI      | 0x9b / 0x1b 0x5b | "Second Escape", see below                            |                   | ✅  |
| BBD      | 0x9c / 0x1b 0x5c | Black background                                      | P1, §2.3.2, p.57  | ✅  |
| NBD      | 0x9d / 0x1b 0x5d | New background, copies fg to bg color                 | P1, §2.3.2, p.57  | ✅  |
| HMS      | 0x9e / 0x1b 0x5e | Hold mosaic: print last mosaic on receiving serial C1 | P1, §2.2, p.50    |     |
| RMS      | 0x9f / 0x1b 0x5f | Release mosaic: print space on receiving serial C1    | P1, §2.2, p.50    |     | 

## The Parallel Supplementary Control Function Set C1

The parallel C1 set is coded identically to the serial C1 set, see above.

The parallel attribute definitions are also used for full screen and full row attributes, see Part 1, §3.5.2, page 88.

## Escape Sequences

Definitions of sequences and their meaning are spread all over the standard. In this table, sequences are ordered numerically by their byte values, where possible.

| Sequence       | Bytes                    | Description                             | References       | OK? |
| -------------- | ------------------------ | --------------------------------------- | ---------------- | --- |
| ESC 2/3 2/0 Fe | 0x1b 0x23 0x20 0x40-0x5f | Full screen attributes                  | P1, §3.5.2, p.88 | ✅  |
| ESC 2/3 2/1 Fe | 0x1b 0x23 0x21 0x40-0x5f | Full row attributes                     | P1, §3.5.2, p.88 | ✅  |
| ESC 4/0-5/15   | 0x1b 0x40-0x45           | Supplementary Control Set C1, see above |                  | ✅  |


## Control Sequence Introducer (CSI) Sequences

These sequences all start with the "second escape" 0x9b. Note that CSI can also be expressed as `ESC 0x5b`.

| Sequence | Bytes     | Description       | References       | OK? |
| -------- | --------- | ----------------- | ---------------- | --- |
| CSI 4/2  | 0x9b 0x42 | STC: stop conceal | P1, §3.5.1, p.88 | ✅  |
