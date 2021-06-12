# T/TE 06-01 / ETS 300 072 Control Sequences

The "CEPT" standard, correctly identified as [T/TE 06-01 "Videotex"](https://en.wikipedia.org/wiki/CEPT_Recommendation_T/CD_06-01), and later adopted by ETSI as [ETS 300 072](https://www.etsi.org/deliver/etsi_i_ets/300001_300099/300072/01_60/ets_300072e01p.pdf), defines a Videotex terminal functionally: the display model as well as the byte sequences that control such a terminal.

The standard is sometimes hard to read (using terminology not in common use after 35+ years), and definitions are spread out over multiple sections. This document tries to summarize all defined control sequences.

In the tables, the bytes column gives the byte sequence in hex; numbers in the description are also hex. Unless otherwise noted, entries are sorted lexically by their byte sequence.

"References" point to the part, section, and page number in the standard where information on this control function can be found.

The column "OK?" indicates whether this sequence is supported in cept.js.

### See Also

* [T/TE 06-05 aka ETS 300 076](https://www.etsi.org/deliver/etsi_i_ets/300001_300099/300076/01_60/ets_300076e01p.pdf)
* [ISO 2022](https://en.wikipedia.org/wiki/ISO/IEC_2022), while not referenced in T/TE 06-01, is closely related

## APA vs. US and Data Types

The standard is grouped into functional blocks (see part 0, §1.1.1, page 2), where each functional block has its own two byte prefix. The following table lists these prefixes. Each sequence switches the terminal between functional modes.

The US control character is encoded as hex `1f` and shares the code with the Active Position Address (APA) control sequence. The second byte of the sequence can be used to distinguish between the two cases.

| Sequence    | Bytes                    | Description                       | References     | OK? |
| ----------- | ------------------------ | --------------------------------- | -------------- | --- |
| US 2/0, 2/1 | `1f 20` / `1f 21`        | Terminal Facility Identifier      | T/TE 06-05     |     |
| US 2/3      | `1f 23`                  | Define DRCS                       | Part 4         |     |
| US 2/6      | `1f 26`                  | Define Color                      | Part 5         |     |
| US 2/13     | `1f 2d`                  | Define Format                     |                |     |
| US 2/14     | `1f 2e`                  | Timing Control                    | Part 11        |     |
| US 2/15     | `1f 2f`                  | Reset                             | Part 8         |     |
| US 3/0      | `1f 30`                  | Reserved                          |                |     |
| US 3/1      | `1f 31`                  | Geometric display data (3D)       | T/TE 06-02     |     |
| US 3/2      | `1f 32`                  | Geometric display data (2D)       | T/TE 06-02     |     |
| US 3/4      | `1f 34`                  | Photographic pixel data           |                |     |
| US 3/5      | `1f 35`                  | Photographic table data           |                |     |
| US 3/11     | `1f 3b`                  | Sound                             |                |     |
| US 3/12     | `1f 3c`                  | Reserved (private use)            |                |     |
| US 3/14     | `1f 3e`                  | Telesoftware data                 |                |     |
| US 3/15     | `1f 3f`                  | Transparent data                  | T/TE 06-03     |     |
| APA *y x*   | `1f` `40`-`7f` `40`-`7f` | Move cursor to *y*-`40`, *x*-`40` | P1, §2.2, p.49 | ✅  |


## Primary Control Function Set C0

The code points are defined in part 1, section 3.2, on page 75. The definitions are mostly in section 2.

| Sequence  | Bytes                    | Description                                            | References       | OK? |
| --------- | ------------------------ | ------------------------------------------------------ | ---------------- | --- |
| APB       | `08`                     | Move cursor left (aka backspace)                       | P1, §2.2, p.49   | ✅  |
| APF       | `09`                     | Move cursor right                                      | P1, §2.2, p.49   | ✅  |
| APD       | `0a`                     | Move cursor down (aka line feed)                       | P1, §2.2, p.49   | ✅  |
| APU       | `0b`                     | Move cursor up                                         | P1, §2.2, p.49   | ✅  |
| CS        | `0c`                     | Clear screen                                           | P1, §2.2, p.49   | ✅  |
| APR       | `0d`                     | Move cursor to beginning of line (aka carriage return) | P1, §2.2, p.49   | ✅  |
| SO        | `0e`                     | Shift Out, activate G2 in 20-7f                        | P1, §3.1.2, p.72 | ✅  |
| SI        | `0f`                     | Shift In, activate G0 in 20-7f                         | P1, §3.1.2, p.72 | ✅  |
| CON       | `11`                     | Cursor on, do display cursor                           | P1, §2.4.1, p.68 | ✅  |
| RPT *n*   | `12` `40`-`7f`           | Repeat the last alpha character *n*-`40` times         |                  | ✅  |
| INI       | `13`                     |                                                        |                  |     |
| COF       | `14`                     | Cursor off, do not display cursor                      | P1, §2.4.1, p.68 | ✅  |
| CAN       | `18`                     | Cancel, fill the rest of the line with spaces          | P1, §2.2, p.49   | ✅  |
| SS2       | `19`                     | Single Shift 2, activate G2 in 20-7f for one char      | P1, §3.1.2, p.72 | ✅  |
| DCT       | `1a`                     |                                                        |                  |     |
| ESC       | `1b`                     | Escape, see below                                      | P1, §3.1.2, p.72 | ✅  |
| TER       | `1c`                     |                                                        |                  |     |
| SS3       | `1d`                     | Single Shift 3, activate G3 in 20-7f for one char      |                  | ✅  |
| APH       | `1e`                     | Move cursor to (1,1)                                   | P1, §2.2, p.49   | ✅  |
| APA *y x* | `1f` `40`-`7f` `40`-`7f` | Move cursor to *y*-`40`, *x*-`40`                      | P1, §2.2, p.49   | ✅  |
| US ...    | `1f` ...                 | See VPCE below                                         |                  | ✅  |
| ...       | `20`-`7e`                | Print character as per selected set                    |                  | ✅  |
| DEL       | `7f`                     | Print DEL char (alpha) or all-foreground (mosaic)      | P1, §2.2, p.50   | ✅  |
|           | `80`-`9f`                | C1 set, see below                                      |                  | ✅  |
| ...       | `a0`-`ff`                | Print character as per selected set                    |                  | ✅  |


## The Serial Supplementary Control Function Set C1

These sequences set colors and attributes in serial mode. There are two ways in which they can be invoked: Directly from the upper control character range (`80`-`9f`), or through ESC *x*, where *x* is `40`-`5f`. Note that the standard shows the C1 set in the range `40`-`5f` (without the ESC).

Serial attributes apply to the current position and all others to the right on the current row, or until the next marker.

You switch between the serial and the parallel C1 set with `1b 22 40` (serial) and `1b 22 41` (parallel).

Colors are from the current Color Lookup Table (CLUT), see `CSI n 4/0`, below.

The code points are defined in Part 1, §3.3.1, page 77. For descriptions of the effects of these controls, see Part 1, §1.3, page 8ff, and the reference in the table.


| Sequence | Bytes | Description                                           | References        | OK? |
| -------- | ----- | ----------------------------------------------------- | ----------------- | --- |
| ABK      | `80`  | Select alpha repertory and black (1) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANR      | `81`  | Select alpha repertory and red (2) foreground         | P1, §2.3.1b, p.53 | ✅  |
| ANG      | `82`  | Select alpha repertory and green (3) foreground       | P1, §2.3.1b, p.53 | ✅  |
| ANY      | `83`  | Select alpha repertory and yellow (4) foreground      | P1, §2.3.1b, p.53 | ✅  |
| ANB      | `84`  | Select alpha repertory and blue (5) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANM      | `85`  | Select alpha repertory and magenta (6) foreground     | P1, §2.3.1b, p.53 | ✅  |
| ANC      | `86`  | Select alpha repertory and cyan (7) foreground        | P1, §2.3.1b, p.53 | ✅  |
| ANW      | `87`  | Select alpha repertory and white (8) foreground       | P1, §2.3.1b, p.53 | ✅  |
| FSH      | `88`  | Enable flash                                          | P1, §2.3.5, p.60  | ✅  |
| STD      | `89`  | Disable flash (steady)                                | P1, §2.3.5, p.60  | ✅  |
| EBX      | `8a`  | Enable window/box                                     | P1, §2.3.8, p.63  | ✅  |
| SBX      | `8b`  | Stop window/box                                       | P1, §2.3.8, p.63  | ✅  |
| NSZ      | `8c`  | Normal size                                           | P1, §2.3.4, p.59  | ✅  |
| DBH      | `8d`  | Double height                                         | P1, §2.3.4, p.59  | ✅  |
| DBW      | `8e`  | Double width                                          | P1, §2.3.4, p.59  | ✅  |
| DBS      | `8f`  | Double size                                           | P1, §2.3.4, p.59  | ✅  |
| MBK      | `90`  | Select mosaic repertory and black (1) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSR      | `91`  | Select mosaic repertory and red (2) foreground        | P1, §2.3.1b, p.54 | ✅  |
| MSG      | `92`  | Select mosaic repertory and green (3) foreground      | P1, §2.3.1b, p.54 | ✅  |
| MSY      | `93`  | Select mosaic repertory and yellow (4) foreground     | P1, §2.3.1b, p.54 | ✅  |
| MSB      | `94`  | Select mosaic repertory and blue (5) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSM      | `95`  | Select mosaic repertory and magenta (6) foreground    | P1, §2.3.1b, p.54 | ✅  |
| MSC      | `96`  | Select mosaic repertory and cyan (7) foreground       | P1, §2.3.1b, p.54 | ✅  |
| MSW      | `97`  | Select mosaic repertory and white (8) foreground      | P1, §2.3.1b, p.54 | ✅  |
| CDY      | `98`  | Conceal display; stop conceal is `CSI 4/2`            | P1, §2.3.6, p.62  | ✅  |
| SPL      | `99`  | Stop lining                                           | P1, §2.3.3, p.59  | ✅  |
| STL      | `9a`  | Start lining                                          | P1, §2.3.3, p.59  | ✅  |
| CSI      | `9b`  | "Second Escape", see below                            |                   | ✅  |
| BBD      | `9c`  | Black background                                      | P1, §2.3.2, p.57  | ✅  |
| NBD      | `9d`  | New background, copies fg to bg color                 | P1, §2.3.2, p.57  | ✅  |
| HMS      | `9e`  | Hold mosaic: print last mosaic on receiving serial C1 | P1, §2.2, p.50    | ✅  |
| RMS      | `9f`  | Release mosaic: print space on receiving serial C1    | P1, §2.2, p.50    | ✅  |

## The Parallel Supplementary Control Function Set C1

The parallel C1 set is coded identically to the serial C1 set, see above.

The code points are defined in Part 1, §3.3.2, page 77. For descriptions of the effects of these controls, see Part 1, §1.3, page 8ff, and the reference in the table.

The parallel attribute definitions are also used for full screen and full row attributes, see Part 1, §3.5.2, page 88.

| Sequence | Bytes | Description                   | References        | OK? |
| -------- | ----- | ----------------------------- | ----------------- | --- |
| BKF      | `80`  | Select black (1) foreground   | P1, §2.3.1c, p.55 | ✅  |
| RDF      | `81`  | Select red (2) foreground     | P1, §2.3.1c, p.55 | ✅  |
| GRF      | `82`  | Select green (3) foreground   | P1, §2.3.1c, p.55 | ✅  |
| YLF      | `83`  | Select yellow (4) foreground  | P1, §2.3.1c, p.55 | ✅  |
| BLF      | `84`  | Select blue (5) foreground    | P1, §2.3.1c, p.55 | ✅  |
| MGF      | `85`  | Select magenta (6) foreground | P1, §2.3.1c, p.55 | ✅  |
| CNF      | `86`  | Select cyan (7) foreground    | P1, §2.3.1c, p.55 | ✅  |
| WHF      | `87`  | Select white (8) foreground   | P1, §2.3.1c, p.55 | ✅  |
| FSH      | `88`  | Enable flash                  | P1, §2.3.5, p.60  | ✅  |
| STD      | `89`  | Disable flash (steady)        | P1, §2.3.5, p.60  | ✅  |
| EBX      | `8a`  | Enable window/box             | P1, §2.3.8, p.63  | ✅  |
| SBX      | `8b`  | Stop window/box               | P1, §2.3.8, p.63  | ✅  |
| NSZ      | `8c`  | Normal size                   | P1, §2.3.4, p.59  | ✅  |
| DBH      | `8d`  | Double height                 | P1, §2.3.4, p.59  | ✅  |
| DBW      | `8e`  | Double width                  | P1, §2.3.4, p.59  | ✅  |
| DBS      | `8f`  | Double size                   | P1, §2.3.4, p.59  | ✅  |
| BKB      | `90`  | Select black (1) background   | P1, §2.3.2c, p.58 | ✅  |
| RDB      | `91`  | Select red (2) background     | P1, §2.3.2c, p.58 | ✅  |
| GRB      | `92`  | Select green (3) background   | P1, §2.3.2c, p.58 | ✅  |
| YLB      | `93`  | Select yellow (4) background  | P1, §2.3.2c, p.58 | ✅  |
| BLB      | `94`  | Select blue (5) background    | P1, §2.3.2c, p.58 | ✅  |
| MGB      | `95`  | Select magenta (6) background | P1, §2.3.2c, p.58 | ✅  |
| CNB      | `96`  | Select cyan (7) background    | P1, §2.3.2c, p.58 | ✅  |
| WHB      | `97`  | Select white (8) background   | P1, §2.3.2c, p.58 | ✅  |
| CDY      | `98`  | Conceal Display               | P1, §2.3.6, p.62  | ✅  |
| SPL      | `99`  | Stop lining                   | P1, §2.3.3, p.59  | ✅  |
| STL      | `9a`  | Start lining                  | P1, §2.3.3, p.59  | ✅  |
| CSI      | `9b`  | "Second Escape", see below    |                   | ✅  |
| NPO      | `9c`  | Normal polarity               | P1, §2.3.7, p.62  | ✅  |
| IPO      | `9d`  | Inverted polarity             | P1, §2.3.7, p.62  | ✅  |
| TRB      | `9e`  | Transparent background        | P1, §2.3.2c, p.58 | ✅  |
| STC      | `9f`  | Stop conceal (also `CSI 4/2`) | P1, §2.3.7, p.62  | ✅  |

## Escape Sequences


| Sequence         | Bytes                | Description                                       | References       | OK? |
| ---------------- | -------------------- | ------------------------------------------------- | ---------------- | --- |
| ESC 2/2 4/0      | `1b 22 40`           | Activate serial C1 set                            | P1, §3.3.1, p.77 | ✅  |
| ESC 2/2 4/1      | `1b 22 41`           | Activate parallel C1 set                          | P1, §3.3.1, p.77 | ✅  |
| ESC 2/3 2/0 Fe   | `1b 23 20` `40`-`5f` | Full screen attributes                            | P1, §3.5.2, p.88 | ✅  |
| ESC 2/3 2/1 Fe   | `1b 23 21` `40`-`5f` | Full row attributes                               | P1, §3.5.2, p.88 | ✅  |
| ESC 4/0-5/15     | `1b` `40`-`45`       | Supplementary Control Set C1, see above           |                  | ✅  |
| ESC 2/8 2/1 4/0  | `1b 28 21 40`        | Select Greek for G0                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 4/0      | `1b 28 40`           | Select Latin Primary for G0                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/2      | `1b 28 62`           | Select Supplementary Graphic for G0               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/3      | `1b 28 63`           | Select 2nd Supplementary Mosaic for G0            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/8 6/4      | `1b 28 64`           | Select 3rd Supplementary Mosaic for G0            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 2/1 4/0  | `1b 29 21 40`        | Select Greek for G1                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 4/0      | `1b 29 40`           | Select Latin Primary for G1                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 6/2      | `1b 29 62`           | Select Supplementary Graphic for G1               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/9 6/3      | `1b 29 63`           | Select 2nd Supplementary Mosaic for G1            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/4     | `1b 2a 64`           | Select 3rd Supplementary Mosaic for G1            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 2/1 4/0 | `1b 2a 21 40`        | Select Greek for G2                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 4/0     | `1b 2a 40`           | Select Latin Primary for G2                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/2     | `1b 2a 62`           | Select Supplementary Graphic for G2               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/3     | `1b 2a 63`           | Select 2nd Supplementary Mosaic for G2            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/10 6/4     | `1b 2a 64`           | Select 3rd Supplementary Mosaic for G2            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 2/1 4/0 | `1b 2b 21 40`        | Select Greek for G3                               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 4/0     | `1b 2b 40`           | Select Latin Primary for G3                       | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/2     | `1b 2b 62`           | Select Supplementary Graphic for G3               | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/3     | `1b 2b 63`           | Select 2nd Supplementary Mosaic for G3            | P1, §3.4.4, p.87 | ✅  |
| ESC 2/11 6/4     | `1b 2b 64`           | Select 3rd Supplementary Mosaic for G3            | P1, §3.4.4, p.87 | ✅  |
| ESC 3/5          | `1b 35`              | RDW: Recording device wait                        | P1, §3.6.2, p.92 |     |
| ESC 3/6          | `1b 36`              | RDS: Recording device start                       | P1, §3.6.2, p.92 |     |
| ESC 3/7          | `1b 37`              | RDT: Recording device stop                        | P1, §3.6.2, p.92 |     |
| ESC 3/8          | `1b 38`              | HCW: Hard copy device wait                        | P1, §3.6.2, p.92 |     |
| ESC 3/9          | `1b 39`              | HCS: Hard copy device start                       | P1, §3.6.2, p.92 |     |
| ESC 3/10         | `1b 3a`              | HCT: Hard copy device stop                        | P1, §3.6.2, p.92 |     |
| ESC 3/11         | `1b 3b`              | EBU: Empty buffer                                 | P1, §3.6.2, p.92 |     |
| ESC 3/12         | `1b 3b`              | DDO: Display device on                            | P1, §3.6.2, p.92 |     |
| ESC 3/13         | `1b 3c`              | DDF: Display device off                           | P1, §3.6.2, p.92 |     |
| ESC 3/14         | `1b 3d`              | ADO: Auxiliary device on                          | P1, §3.6.2, p.92 |     |
| ESC 3/15         | `1b 3e`              | ADF: Auxiliary device off                         | P1, §3.6.2, p.92 |     |
| ESC 6/14         | `1b 6e`              | LS2: Locking shift 2, activate G2 in 20-7e        | P1, §3.7.2, p.93 |     |
| ESC 6/15         | `1b 6f`              | LS3: Locking shift 3, activate G3 in 20-7e        | P1, §3.7.2, p.93 |     |
| ESC 7/12         | `1b 7c`              | LS3R: Locking shift 3 right, activate G3 in a0-fe | P1, §3.7.2, p.93 |     |
| ESC 7/13         | `1b 7d`              | LS2R: Locking shift 2 right, activate G2 in a0-fe | P1, §3.7.2, p.93 |     |
| ESC 7/14         | `1b 7e`              | LS1R: Locking shift 1 right, activate G1 in a0-fe | P1, §3.7.2, p.93 |     |


## Control Sequence Introducer (CSI) Sequences

These sequences all start with the "second escape" `9b`. Note that CSI can also be encoded as `1b 5b`.

Unlike the other tables, this table is sorted by the last byte in the sequence, since all CSI sequences share the same encoding: a number of parameters followed by the function code.

The letter `n` designates one or more digits from the range `30`-`39` (ASCII 0-9), which is interpreted as a number, for example selecting the color table.

The letter `z` designates a single digit from the range `30`-`32`, where `30` is full screen, `31` is full row, and `32` is serial or parallel attribute. See above for C1 mode selection.

| Sequence             | Bytes                  | Description                               | References       | OK? |
| -------------------- | ---------------------- | ----------------------------------------- | ---------------- | --- |
| CSI *n* 4/0          | `9b` *n* `40`          | CT1-CT4: select color table d (0-3)       | P1, §3.5.6, p.90 | ✅  |
| CSI 3/0 4/1          | `9b 30 41`             | IVF: inverted flash                       | P1, §3.5.6, p.91 | ✅  |
| CSI 3/1 4/1          | `9b 31 41`             | RIF: reduced intensity flash              | P1, §3.5.6, p.91 | ✅  |
| CSI 3/2 4/1          | `9b 32 41`             | FF1: fast flash 1                         | P1, §3.5.6, p.91 | ✅  |
| CSI 3/3 4/1          | `9b 33 41`             | FF1: fast flash 2                         | P1, §3.5.6, p.91 | ✅  |
| CSI 3/4 4/1          | `9b 34 41`             | FF1: fast flash 3                         | P1, §3.5.6, p.91 | ✅  |
| CSI 3/5 4/1          | `9b 35 41`             | ICF: increment flash                      | P1, §3.5.6, p.91 | ✅  |
| CSI 3/6 4/1          | `9b 36 41`             | DCF: decrement flash                      | P1, §3.5.6, p.91 | ✅  |
| CSI 4/2              | `9b 42`                | STC: stop conceal (also parallel C1 `9f`) | P1, §3.5.1, p.88 | ✅  |
| CSI *z* 5/0          | `9b` *z* `50`          | PMS: protected mode start                 | P1, §3.5.3, p.89 |     |
| CSI *z* 5/1          | `9b` *z* `51`          | PMT: protected mode stop                  | P1, §3.5.3, p.89 |     |
| CSI 3/2 5/2          | `9b 32 52`             | PMI: protected mode idle, serial/parallel | P1, §3.5.3, p.89 |     |
| CSI *z* 5/3          | `9b` *z* `53`          | MMS: marked mode start                    | P1, §3.5.3, p.89 |     |
| CSI *z* 5/4          | `9b` *z* `54`          | MMT: marked mode stop                     | P1, §3.5.3, p.89 |     |
| CSI *n* 3/11 *n* 5/5 | `9b` *n* `3b` *n* `55` | Create scrolling area.                    | P1, §3.5.5, p.90 |     |
| CSI *n* 3/11 *n* 5/6 | `9b` *n* `3b` *n* `56` | Delete scrolling area.                    | P1, §3.5.5, p.90 |     |
| CSI 3/0 6/0          | `9b 30 60`             | Scroll up                                 | P1, §3.6.2, p.92 |     |
| CSI 3/1 6/0          | `9b 31 60`             | Scroll down                               | P1, §3.6.2, p.92 |     |
| CSI 3/2 6/0          | `9b 32 60`             | Activate implicit scrolling               | P1, §3.6.2, p.92 |     |
| CSI 3/3 6/0          | `9b 33 60`             | Deactivate implicit scrolling             | P1, §3.6.2, p.92 |     |

The encoding for scrolling area (P1, §3.5.5, p.90) is slightly more complicated: after the CSI, the upper row is expressed with one to three ASCII digits (`30`-`39`), then `3b`, then the lower row as up to three digits, and finally the operation. Note that the decoder has to accumulate the digits and search for `3b` and `55`/`56` to identify this sequence.
