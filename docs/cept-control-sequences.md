# T/TE 06-01 / ETS 300 072 Control Sequences

The standard is sometimes hard to read, and definitions are spread out over multiple sections. This document tries to summarize all defined control sequences.

In the tables, the bytes column gives the byte sequence in hex; numbers in the description are also hex. Unless otherwise noted, entries are sorted lexically by the byte sequence.

"References" point to the part, section, and page number in the standard where information on this control function can be found.

The column "OK?" indicates whether this sequence is supported in cept.js.

## Primary Control Function Set C0

The code points are defined in part 1, section 3.2, on page 75. The definitions are mostly in section 2.

| Sequence | Bytes          | Description                                            | References     | OK? |
| -------- | -------------- | ------------------------------------------------------ | -------------- | --- |
| APB      | 08             | Move cursor left (aka backspace)                       | P1, §2.2, p.49 | ✅  |
| APF      | 09             | Move cursor right                                      | P1, §2.2, p.49 | ✅  |
| APD      | 0a             | Move cursor down (aka line feed)                       | P1, §2.2, p.49 | ✅  |
| APU      | 0b             | Move cursor up                                         | P1, §2.2, p.49 | ✅  |
| CS       | 0c             | Clear screen                                           | P1, §2.2, p.49 | ✅  |
| APR      | 0d             | Move cursor to beginning of line (aka carriage return) | P1, §2.2, p.49 | ✅  |
| SO       | 0e             | Shift Out, activate G2 in 20-7f                        |                | ✅  |
| SI       | 0f             | Shift In, activate G0 in 20-7f                         |                | ✅  |
| CON      | 11             |                                                        |                |     |
| RPT n    | 12 40-7f       | Repeat the last alpha character n-40 times             |                | ✅  |
| COF      | 14             |                                                        |                |     |
| CAN      | 18             | Cancel, fill the rest of the line with spaces          | P1, §2.2, p.49 | ✅  |
| SS2      | 19             | Single Shift 2, activate G2 in 20-7f for one char      |                | ✅  |
| ESC      | 1b             | Escape, see below                                      |                | ✅  |
| SS3      | 1d             | Single Shift 3, activate G3 in 20-7f for one char      |                | ✅  |
| APH      | 1e             | Move cursor to (1,1)                                   | P1, §2.2, p.49 | ✅  |
| APA y x  | 1f 40-7f 40-7f | Move cursor to y-40, x-40                              | P1, §2.2, p.49 | ✅  |
| US ...   | 1f ...         | See VPCE below                                         |                | ✅  |
| ...      | 20-7e          | Print character as per selected set                    |                | ✅  |
| DEL      | 7f             | Print DEL char (alpha) or all-foreground (mosaic)      |                |     |
|          | 80-9f          | C1 set, see below                                      |                | ✅  |
| ...      | a0-ff          | Print character as per selected set                    |                | ✅  |


## The Serial Supplementary Control Function Set C1

These sequences set colors and attributes in serial mode. There are two ways in which they can be invoked: Directly from the upper control character range (80-9f), or through ESC x, where x is 40-5f.

Serial attributes apply to the current position and all others to the right on the current row, or until the next marker.

You switch between the serial and the parallel C1 set with `1b 22 40` (serial) and `1b 22 41` (parallel).

Colors are from the current Color Lookup Table (CLUT), see XXX below.

The code points are defined in Part 1, §3.3.1, page 77. For descriptions of the effects of these controls, see Part 1, §1.3, page 8ff, and the reference in the table.


| Sequence | Bytes      | Description                                           | References        | OK? |
| -------- | ---------- | ----------------------------------------------------- | ----------------- | --- |
| ABK      | 80 / 1b 40 | Select alpha repertory and black (1) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANR      | 81 / 1b 41 | Select alpha repertory and red (2) foreground         | P1, §2.3.1b, p.53 | ✅  |
| ANG      | 82 / 1b 42 | Select alpha repertory and green (3) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANY      | 83 / 1b 43 | Select alpha repertory and yellow (4) foreground      | P1, §2.3.1b, p.53 | ✅  |
| ANB      | 84 / 1b 44 | Select alpha repertory and blue (5) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANM      | 85 / 1b 45 | Select alpha repertory and magenta (6) foreground     | P1, §2.3.1b, p.53 | ✅  |
| ANC      | 86 / 1b 46 | Select alpha repertory and cyan (7) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANW      | 87 / 1b 47 | Select alpha repertory and white (8) foreground       | P1, §2.3.1b, p.53 | ✅  |
| FSH      | 88 / 1b 48 | Enable flash                                          | P1, §2.3.5, p.60  | ✅  |
| STD      | 89 / 1b 49 | Disable flash (steady)                                | P1, §2.3.5, p.60  | ✅  |
| EBX      | 8a / 1b 4a | Enable window/box                                     | P1, §2.3.8, p.63  | ✅  |
| SBX      | 8b / 1b 4b | Stop window/box                                       | P1, §2.3.8, p.63  | ✅  |
| NSZ      | 8c / 1b 4c | Normal size                                           | P1, §2.3.4, p.59  | ✅  |
| DBH      | 8d / 1b 4d | Double height                                         | P1, §2.3.4, p.59  | ✅  |
| DBW      | 8e / 1b 4e | Double width                                          | P1, §2.3.4, p.59  | ✅  |
| DBS      | 8f / 1b 4f | Double size                                           | P1, §2.3.4, p.59  | ✅  |
| MBK      | 90 / 1b 50 | Select mosaic repertory and black (1) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSR      | 91 / 1b 51 | Select mosaic repertory and red (2) foreground        | P1, §2.3.1b, p.54 | ✅  |
| MSG      | 92 / 1b 52 | Select mosaic repertory and green (3) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSY      | 93 / 1b 53 | Select mosaic repertory and yellow (4) foreground     | P1, §2.3.1b, p.54 | ✅  |
| MSB      | 94 / 1b 54 | Select mosaic repertory and blue (5) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSM      | 95 / 1b 55 | Select mosaic repertory and magenta (6) foreground    | P1, §2.3.1b, p.54 | ✅  |
| MSC      | 96 / 1b 56 | Select mosaic repertory and cyan (7) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSW      | 97 / 1b 57 | Select mosaic repertory and white (8) foreground      | P1, §2.3.1b, p.54 | ✅  |
| CDY      | 98 / 1b 58 | Conceal display; stop conceal is `CSI 4/2`            | P1, §2.3.6, p.62  | ✅  |
| SPL      | 99 / 1b 59 | Stop lining                                           | P1, §2.3.3, p.59  | ✅  |
| STL      | 9a / 1b 5a | Start lining                                          | P1, §2.3.3, p.59  | ✅  |
| CSI      | 9b / 1b 5b | "Second Escape", see below                            |                   | ✅  |
| BBD      | 9c / 1b 5c | Black background                                      | P1, §2.3.2, p.57  | ✅  |
| NBD      | 9d / 1b 5d | New background, copies fg to bg color                 | P1, §2.3.2, p.57  | ✅  |
| HMS      | 9e / 1b 5e | Hold mosaic: print last mosaic on receiving serial C1 | P1, §2.2, p.50    |     |
| RMS      | 9f / 1b 5f | Release mosaic: print space on receiving serial C1    | P1, §2.2, p.50    |     |

## The Parallel Supplementary Control Function Set C1

The parallel C1 set is coded identically to the serial C1 set, see above.

The parallel attribute definitions are also used for full screen and full row attributes, see Part 1, §3.5.2, page 88.

## Escape Sequences


| Sequence         | Bytes          | Description                                       | References       | OK? |
| ---------------- | -------------- | ------------------------------------------------- | ---------------- | --- |
| ESC 2/2 4/0      | 1b 22 40       | Activate serial C1 set                            | P1, §3.3.1, p.77 | ✅  |
| ESC 2/2 4/1      | 1b 22 41       | Activate parallel C1 set                          | P1, §3.3.1, p.77 | ✅  |
| ESC 2/3 2/0 Fe   | 1b 23 20 40-5f | Full screen attributes                            | P1, §3.5.2, p.88 | ✅  |
| ESC 2/3 2/1 Fe   | 1b 23 21 40-5f | Full row attributes                               | P1, §3.5.2, p.88 | ✅  |
| ESC 4/0-5/15     | 1b 40-45       | Supplementary Control Set C1, see above           |                  | ✅  |
| ESC 2/8 2/1 4/0  | 1b 28 21 40    | Select Greek for G0                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 4/0      | 1b 28 40       | Select Latin Primary for G0                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/2      | 1b 28 62       | Select Supplementary Graphic for G0               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/3      | 1b 28 63       | Select 2nd Supplementary Mosaic for G0            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/4      | 1b 28 64       | Select 3rd Supplementary Mosaic for G0            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 2/1 4/0  | 1b 29 21 40    | Select Greek for G1                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 4/0      | 1b 29 40       | Select Latin Primary for G1                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 6/2      | 1b 29 62       | Select Supplementary Graphic for G1               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 6/3      | 1b 29 63       | Select 2nd Supplementary Mosaic for G1            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/4     | 1b 2a 64       | Select 3rd Supplementary Mosaic for G1            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 2/1 4/0 | 1b 2a 21 40    | Select Greek for G2                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 4/0     | 1b 2a 40       | Select Latin Primary for G2                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/2     | 1b 2a 62       | Select Supplementary Graphic for G2               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/3     | 1b 2a 63       | Select 2nd Supplementary Mosaic for G2            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/4     | 1b 2a 64       | Select 3rd Supplementary Mosaic for G2            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 2/1 4/0 | 1b 2b 21 40    | Select Greek for G3                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 4/0     | 1b 2b 40       | Select Latin Primary for G3                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/2     | 1b 2b 62       | Select Supplementary Graphic for G3               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/3     | 1b 2b 63       | Select 2nd Supplementary Mosaic for G3            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/4     | 1b 2b 64       | Select 3rd Supplementary Mosaic for G3            | P1, §3.4.4, p.87 | ✅  |
| ESC 3/5          | 1b 35          | RDW: Recording device wait                        | P1, §3.6.2, p.92 |     |
| ESC 3/6          | 1b 36          | RDS: Recording device start                       | P1, §3.6.2, p.92 |     |
| ESC 3/7          | 1b 37          | RDT: Recording device stop                        | P1, §3.6.2, p.92 |     |
| ESC 3/8          | 1b 38          | HCW: Hard copy device wait                        | P1, §3.6.2, p.92 |     |
| ESC 3/9          | 1b 39          | HCS: Hard copy device start                       | P1, §3.6.2, p.92 |     |
| ESC 3/10         | 1b 3a          | HCT: Hard copy device stop                        | P1, §3.6.2, p.92 |     |
| ESC 3/11         | 1b 3b          | EBU: Empty buffer                                 | P1, §3.6.2, p.92 |     |
| ESC 3/12         | 1b 3b          | DDO: Display device on                            | P1, §3.6.2, p.92 |     |
| ESC 3/13         | 1b 3c          | DDF: Display device off                           | P1, §3.6.2, p.92 |     |
| ESC 3/14         | 1b 3d          | ADO: Auxiliary device on                          | P1, §3.6.2, p.92 |     |
| ESC 3/15         | 1b 3e          | ADF: Auxiliary device off                         | P1, §3.6.2, p.92 |     |
| ESC 6/14         | 1b 6e          | LS2: Locking shift 2, activate G2 in 20-7e        | P1, §3.7.2, p.93 |     |
| ESC 6/15         | 1b 6f          | LS3: Locking shift 3, activate G3 in 20-7e        | P1, §3.7.2, p.93 |     |
| ESC 7/12         | 1b 7c          | LS3R: Locking shift 3 right, activate G3 in a0-fe | P1, §3.7.2, p.93 |     |
| ESC 7/13         | 1b 7d          | LS2R: Locking shift 2 right, activate G2 in a0-fe | P1, §3.7.2, p.93 |     |
| ESC 7/14         | 1b 7e          | LS1R: Locking shift 1 right, activate G1 in a0-fe | P1, §3.7.2, p.93 |     |


## Control Sequence Introducer (CSI) Sequences

These sequences all start with the "second escape" `9b`. Note that CSI can also be encoded as `1b 5b`.

Unlike the other tables, this table is sorted by the last byte in the sequence, since all CSI sequences share the same encoding: a number of parameters followed by the function code.

The letter `n` designates one or more digits from the range `30`-`39` (ASCII 0-9), which is interpreted as a number, for example selecting the color table.

The letter `z` designates a single digit from the range `30`-`32`, where `30` is full screen, `31` is full row, and `32` is serial or parallel attribute. See above for C1 mode selection.

| Sequence         | Bytes        | Description                               | References       | OK? |
| ---------------- | ------------ | ----------------------------------------- | ---------------- | --- |
| CSI n 4/0        | 9b n 40      | CT1: select color table d (0-3)           | P1, §3.5.6, p.90 |     |
| CSI 3/0 4/1      | 9b 30 41     | IVF: inverted flash                       | P1, §3.5.6, p.91 |     |
| CSI 3/1 4/1      | 9b 30 41     | RIF: reduced intensity flash              | P1, §3.5.6, p.91 |     |
| CSI 3/2 4/1      | 9b 30 41     | FF1: fast flash 1                         | P1, §3.5.6, p.91 |     |
| CSI 3/3 4/1      | 9b 30 41     | FF1: fast flash 2                         | P1, §3.5.6, p.91 |     |
| CSI 3/4 4/1      | 9b 30 41     | FF1: fast flash 3                         | P1, §3.5.6, p.91 |     |
| CSI 3/5 4/1      | 9b 30 41     | ICF: increment flash                      | P1, §3.5.6, p.91 |     |
| CSI 3/6 4/1      | 9b 30 41     | DCF: decrement flash                      | P1, §3.5.6, p.91 |     |
| CSI 4/2          | 9b 42        | STC: stop conceal                         | P1, §3.5.1, p.88 | ✅  |
| CSI z 5/0        | 9b a 50      | PMS: protected mode start                 | P1, §3.5.3, p.89 |     |
| CSI z 5/1        | 9b a 51      | PMT: protected mode stop                  | P1, §3.5.3, p.89 |     |
| CSI 3/2 5/2      | 9b 32 52     | PMI: protected mode idle, serial/parallel | P1, §3.5.3, p.89 |     |
| CSI z 5/3        | 9b a 53      | MMS: marked mode start                    | P1, §3.5.3, p.89 |     |
| CSI z 5/4        | 9b a 54      | MMT: marked mode stop                     | P1, §3.5.3, p.89 |     |
| CSI n 3/11 n 5/5 | 9b n 3b n 55 | Create scrolling area.                    | P1, §3.5.5, p.90 |     |
| CSI n 3/11 n 5/6 | 9b n 3b n 56 | Delete scrolling area.                    | P1, §3.5.5, p.90 |     |
| CSI 3/0 6/0      | 9b 30 60     | Scroll up                                 | P1, §3.6.2, p.92 |     |
| CSI 3/1 6/0      | 9b 31 60     | Scroll down                               | P1, §3.6.2, p.92 |     |
| CSI 3/2 6/0      | 9b 32 60     | Activate implicit scrolling               | P1, §3.6.2, p.92 |     |
| CSI 3/3 6/0      | 9b 33 60     | Deactivate implicit scrolling             | P1, §3.6.2, p.92 |     |

The encoding for scrolling area (P1, §3.5.5, p.90) is slightly more complicated: after the CSI, the upper row is expressed with one to three ASCII digits (`30`-`39`), then `3b`, then the lower row as up to three digits, and finally the operation. Note that the decoder has to accumulate the digits and search for `3b` and `55`/`56` to identify this sequence.
