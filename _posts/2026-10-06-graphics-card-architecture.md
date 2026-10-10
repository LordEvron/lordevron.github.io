---
title: 'Inside a Graphics Card: Architecture, Tensor Cores, and Defective Chips'
date: '2026-10-06'
author: Lord_evron
layout: post
permalink: /2026/10/06/graphics-card-architecture/
categories:
    - Technical
tags:
    - hardware
    - technology
---

How many calculations does your graphics card perform every second while running a modern game? Running Super Mario 64 back in 1996 required around 100 million calculations per second. Minecraft in 2011 needed something like 100 billion. A game like Cyberpunk 2077 needs a GPU capable of tens of trillions, and the current top consumer card, the **RTX 5090**, does about **105 trillion** per second.

To put that number in perspective: imagine every single person on Earth doing one long multiplication per second. To match an RTX 5090 you would need about **12,800 Earths** full of people, all working together without a break.

Everybody now knows that GPUs are also the engine behind the AI boom, but few people can explain *why* a graphics card is so much better than a CPU at this kind of work, what a "tensor core" actually is, or why an RTX 5090 is technically a "defective" chip. In this article we take a look at all of it: the design philosophy behind a GPU, what's physically inside a graphics card, how work is actually executed on thousands of cores, what tensor cores do, and how NVIDIA (and basically every chip maker) turns imperfect silicon into a full product lineup. We'll use NVIDIA's current **Blackwell** generation (RTX 50 series) as the example throughout.

A lot of the material here is inspired by Branch Education's excellent video [How do Graphics Cards Work? Exploring GPU Architecture](https://www.youtube.com/watch?v=h9Z4oGN89MU), which explores a torn-down RTX 3090 with great 3D animations. The architecture has evolved since then, but the principles are exactly the same, and I strongly recommend it.

## Part 1: Built for Throughput

Inside an RTX 5090, the GPU has over **21,000 cores**. A high-end desktop CPU on the same motherboard might have **16 or 24**. So the GPU is 1,000 times more powerful? Not really: the two are built for completely different jobs.

A useful analogy is to think of a CPU as a **math professor** and a GPU as a **stadium full of students**. The professor can solve any problem, even a long one full of steps and decisions, and solves it quickly. Each student can only do simple sums, and slowly. But hand out 10,000 simple sums, and the stadium finishes long before the professor is done with the first hundred. Likewise a GPU is good at a narrow set of simple operations (mostly arithmetic) applied to **mountains of data**, and it can't run an operating system or talk directly to input devices or networks. In technical terms, a CPU is optimised for **latency** (finish *one* stream of instructions as fast as possible), while a GPU is optimised for **throughput** (finish *millions* of independent small tasks per second, even if each single task is slow).

That difference in goal leads to a completely different use of the silicon area:

```
              CPU                                       GPU
+-------------------------------+        +-------------------------------+
| +---------+  +---------+      |        | ##### ##### ##### ##### ##### |
| | Core    |  | Core    |      |        | ##### ##### ##### ##### ##### |
| | (big)   |  | (big)   |      |        | ##### ##### ##### ##### ##### |
| +---------+  +---------+      |        | ##### ##### ##### ##### ##### |
| +---------+  +---------+      |        | ##### ##### ##### ##### ##### |
| | Core    |  | Core    |      |        | ##### ##### ##### ##### ##### |
| +---------+  +---------+      |        | ##### ##### ##### ##### ##### |
|                               |        |-------------------------------|
|      Large L2 / L3 cache      |        |          L2 cache             |
+-------------------------------+        +-------------------------------+
  few powerful cores,                       thousands of simple ALUs,
  lots of control logic + cache             little control logic per ALU
```

Most of a CPU core's area doesn't do arithmetic at all: it goes into branch predictors, out-of-order execution and big caches, all there to keep a single thread from ever waiting. A GPU makes the opposite bet. It assumes the work is **massively parallel**: the same operation applied to millions of pixels, vertices or matrix elements. In that world, smart prediction is a waste of area; it's far better to spend those transistors on *more arithmetic units*. Let's open one up and see.

## Part 2: Inside the Graphics Card

### The board

Taking apart an RTX 5090, this is roughly what we find:

```
+-----------------------------------------------------------------------+
|  Heatsink + heat pipes / vapor chamber + fans                         |
|  (most of the weight of the card)                                     |
+-----------------------------------------------------------------------+
| PCB                                                                   |
|  [Display]   +------+ +------+          +---------+    [12V-2x6 power]|
|  [ ports ]   | VRAM | | VRAM |  ...     |   GPU   |    [  connector  ]|
|              +------+ +------+          |  GB202  |                   |
|              (16 GDDR7 chips total)     +---------+                   |
|              ..... VRM: dozens of inductors, capacitors, MOSFETs ..... |
+------------------------------||||||||||||||||-------------------------+
                               PCIe 5.0 x16 -> motherboard
```

- **Display outputs** (HDMI 2.1b, DisplayPort 2.1b) on one side.
- The **12 V power connector** (the 16-pin 12V-2x6) on the other side.
- **PCIe 5.0 x16 pins** that plug into the motherboard, which carry data to and from the CPU and system memory.
- Most of the small components on the PCB form the **Voltage Regulator Module (VRM)**. It takes the incoming 12 V and converts it to around 1 V for the GPU. An RTX 5090 is rated at **575 W**, and at such a low voltage that means **hundreds of amps** flowing into the chip.
- All that power becomes heat, so most of the card's weight is the **cooler**: heat pipes or a vapor chamber carry heat from the GPU and memory chips to the radiator fins, where the fans blow it away. (NVIDIA's own 5090 Founders Edition even splits the electronics over separate boards so that air can flow straight through the card, and uses liquid metal between the GPU and the cooler.)
- **32 GB of graphics memory** (GDDR7) spread across 16 chips around the GPU. We'll get back to these.
- And in the center, the brain: the **GPU** itself.

### The GPU chip: anatomy of GB202

The die inside the RTX 5090 is called **GB202** (Blackwell architecture). It's a chip of about **750 mm²** made of **92 billion transistors**, and the vast majority of its area is taken up by processing cores, organised hierarchically:

```
GB202 (full die)
 +-- 12 GPCs  (Graphics Processing Clusters)
       +-- 8 TPCs each  (Texture Processing Clusters)
             +-- 2 SMs each  (Streaming Multiprocessors)
                   +-- 1 RT core (ray tracing)
                   +-- 4 processing blocks, each with:
                         +-- 1 warp scheduler
                         +-- 32 CUDA cores
                         +-- 1 Tensor core

12 × 8 × 2   = 192 SMs
192 × 4 × 32 = 24,576 CUDA cores
192 × 4      = 768 Tensor cores
192 × 1      = 192 RT cores
```

(As we'll see in the last part, the RTX 5090 doesn't have all of these enabled.)

These three types of cores do all of the computation, each with a different job:

- **CUDA cores** (also called shading cores) are simple calculators with an "add" button, a "multiply" button and a few others. They do most of the work when running games.
- **Tensor cores** (5th generation on Blackwell) are matrix multiplication and addition calculators, used for geometric transformations and above all for neural networks and AI.
- **Ray tracing cores** (4th generation) are the largest but fewest, and they accelerate the ray tracing algorithms (finding which triangle a ray of light hits).

The **SM** is the real basic building block. Besides the cores, each SM has a big register file (256 KB), 128 KB of L1 cache / shared memory, and a few **Special Function Units (SFUs)**.

### Inside a CUDA core

Note that the word *core* is pure marketing: a CUDA core is a single arithmetic lane, not a core in the CPU sense. It has no instruction fetch, no branch predictor, nothing. A better comparison is that one SM is roughly a "core", and the CUDA cores are its very wide vector unit.

What is left is a very simple calculator: it does basic math (add, multiply, compare and a few bit operations) on 32-bit numbers, either floating-point (FP32) or integer (INT32). On Blackwell, all 128 cores of an SM can do either type, while on the previous generations only half of them could handle integers.

Of these operations, one matters more than the others: the **FMA (Fused Multiply-Add)**, a multiplication and an addition done in a single step:

```
FMA (Fused Multiply-Add):   result = A × B + C
```

It's not the only thing a core does, but it's the operation that almost all 3D graphics and neural network math boils down to, so it's the one that defines the GPU's performance numbers.

Each CUDA core completes one FMA per clock cycle, which counts as two operations (a multiply and an add). So for an RTX 5090:

```
21,760 cores × 2.41 GHz × 2 operations = ~105 trillion operations per second (or 105 TFLOPS)
```

There's our 105 trillion. (For comparison: RTX 3090 ~36 trillion, RTX 4090 ~83 trillion.)

What about more complicated operations like division, square roots or trigonometric functions? These are handled by the **Special Function Units**, which are far fewer, only a handful per SM against 128 CUDA cores. GPUs are built for the assumption that the common case is multiply and add.

### The rest of the chip

Around the cores we find:

- **16 memory controllers** around the edge, each 32 bits wide, which talk to the GDDR7 chips (16 × 32 = **512-bit** bus).
- The **PCIe 5.0** interface to the CPU. (Older big chips like the RTX 3090's GA102 also had NVLink to connect two cards together; consumer cards dropped it starting with the 40 series.)
- A big **L2 cache** shared by the whole chip: 128 MB on the full GB202, 96 MB enabled on the RTX 5090. For comparison, the RTX 3090 had only 6 MB.
- The **GigaThread Engine**, which manages all the GPCs and SMs and distributes work among them.
- Fixed-function blocks for video encoding/decoding (NVENC/NVDEC) and the display engine.

### Graphics memory: feeding the beast

Even 96 MB of L2 can hold only a small fraction of a game scene. Everything else lives in the graphics memory (VRAM), and different chunks of the scene are continuously transferred between VRAM and the GPU. In fact, when you're staring at a loading screen, most of that time is spent moving the 3D models and textures of the level from your SSD into the VRAM.

Because the cores are performing tens of trillions of calculations per second, GPUs are **data hungry** machines that need to be continuously fed. Back to our stadium: the students are only as fast as the people handing out the worksheets, so the memory system is built to hand out data on many lanes at the same time: the 16 memory chips on a 5090 together transfer **512 bits at a time** (the *bus width*), each pin running at 28 Gbit/s:

```
512 bits × 28 Gbit/s / 8 = 1,792 GB/s  (~1.8 TB/s)
```

Compare that to the DRAM sticks supporting a CPU: each channel is only **64 bits** wide, and even a dual-channel DDR5 desktop gets something around 80-100 GB/s. For many workloads, especially AI, memory bandwidth (not compute) is the real bottleneck.

### More than ones and zeros

You may think computers only use binary 1s and 0s on their wires. To squeeze more data out of each wire, modern graphics memory uses **multiple voltage levels**:

- **GDDR6X** (RTX 30 and 40 series) used **PAM-4**: 4 voltage levels, so each symbol carries **2 bits**.
- **GDDR7** (RTX 50 series) switched to **PAM-3**: 3 voltage levels (-1, 0, +1), i.e. *ternary* digits. Bits are packed into trits with encoding schemes such as **3 bits → 2 trits** (3² = 9 combinations, enough for 2³ = 8) and **11 bits → 7 trits** (3⁷ = 2187, enough for 2¹¹ = 2048). Combined, they send 276 bits using only 176 ternary symbols, about 1.5 bits per symbol.

```
NRZ   (binary):   2 levels -> 1 bit per symbol
PAM-3 (GDDR7):    3 levels -> ~1.5 bits per symbol
PAM-4 (GDDR6X):   4 levels -> 2 bits per symbol
```

Why go from 4 levels *down* to 3? Because with fewer levels the voltage steps are bigger and easier to tell apart: better signal-to-noise ratio, simpler encoders, and better power efficiency, which allows much higher clock rates and in the end more bandwidth. That's how the 5090 gets ~78% more bandwidth than the 4090.

### HBM: memory for AI chips

Datacenter AI accelerators use a different kind of memory: **HBM (High Bandwidth Memory)**. Instead of separate chips on the PCB, HBM is a **stack** of DRAM dies connected vertically by **TSVs (Through-Silicon Vias)**, tiny vertical wires going through the silicon, forming a "cube" of memory placed right next to the GPU on the same package. A single HBM3E stack holds 24 to 36 GB, and a datacenter Blackwell chip like the B200 is surrounded by 8 of them, for **192 GB** and about 8 TB/s of bandwidth.

## Part 3: How the Work Actually Runs

Now that we know the hardware, how do we keep 20,000 cores busy at once?

### Embarrassingly parallel problems

Video game rendering, scientific simulations and neural networks are what computer scientists call **embarrassingly parallel** problems: the work splits naturally into millions of small tasks that don't depend on each other. GPUs run them with **SIMD** (**S**ingle **I**nstruction, **M**ultiple **D**ata): one instruction, repeated across thousands of different numbers.

Take a cowboy hat on a table in a 3D game. The hat is made of about **14,000 vertices**, each with X, Y and Z coordinates relative to the center of the hat. To place it in the game world, every vertex needs the same operation: "add the hat's position in the world".

```
world_x = model_x + hat_x
world_y = model_y + hat_y      <- same instruction, 14,000 vertices,
world_z = model_z + hat_z         one vertex per core
```

No vertex depends on any other, so they can all be computed at the same time. A full scene from the video has **8.3 million vertices**, about **25 million additions**, and that's only one of the first steps of rendering a frame.

### Threads, warps, blocks and grids

Each small task, like moving one vertex, is called a **thread**. The GPU doesn't manage threads one by one: it groups them in teams of **32 called warps**, and all 32 threads in a warp execute the same instruction at the same time, each on its own piece of data. Warps are then grouped into **blocks**, each assigned to one SM, and all the blocks of a job form a **grid** that covers the whole GPU:

```
Thread  (one small task)     ->  1 CUDA core
Warp    (32 threads)         ->  1 processing block
Block   (many warps)         ->  1 SM
Grid    (many blocks)        ->  the whole GPU
```

The downside of moving in teams of 32 is **branches**. If half the threads in a warp need to do one thing and the other half something else (an `if`/`else`), the warp has to run both paths one after the other, with half the threads waiting each time. This is called **warp divergence**, and it's why GPUs are fast on uniform work and slow on code full of decisions.

### Hiding latency instead of avoiding it

Reading data from memory is slow: it takes hundreds of cycles. A CPU fights this with big caches and clever prediction. A GPU takes a simpler approach: it keeps lots of warps ready at the same time, and whenever one is waiting for data, it immediately switches to another one that's ready to go. Think of a chef with many dishes on the stove: while one pot is waiting to boil, they work on the next one instead of standing still.

Each SM can juggle up to 48 warps (1,536 threads) this way, so a 5090 can have over **260,000 threads** in flight at once. That's why the GPU never needs to be smart about any single thread: there's always another one ready.

## Part 4: Tensor Cores

Even with thousands of FP32 ALUs, NVIDIA realised around 2016 that deep learning was spending almost all of its time doing one single operation: **matrix multiplication**. Every fully connected layer, every convolution (after some rearranging), and every attention block in a transformer is, at its heart, a big `A × B` matrix multiply. Neural networks and generative AI need trillions to quadrillions of these operations, on very large matrices.

Doing that with regular CUDA cores means issuing one FMA instruction per element pair. That works, but a lot of energy goes into fetching instructions, reading registers and moving data around, not into the actual math.

So with the **Volta** architecture (V100, 2017), NVIDIA introduced the **Tensor Core**: a dedicated unit that takes three matrices, multiplies the first two, adds the third, and outputs the result:

```
D = A × B + C

  A (4x4)        B (4x4)        C (4x4)        D (4x4)
[ a a a a ]    [ b . . . ]    [ c . . . ]    [ d . . . ]
[ . . . . ]  x [ b . . . ]  + [ . . . . ]  = [ . . . . ]
[ . . . . ]    [ b . . . ]    [ . . . . ]    [ . . . . ]
[ . . . . ]    [ b . . . ]    [ . . . . ]    [ . . . . ]

d = a·b + a·b + a·b + a·b + c   (row of A × column of B, plus C)
```

Each value in the output is the sum of the products of a **row** of the first matrix with a **column** of the second, plus the corresponding value of the third. The key point: since all the values of the three input matrices are available at the same time, the tensor core computes **all** the output values concurrently, in one go. The first Volta tensor core performed 64 FMAs per clock (a 4×4×4 multiply); a regular CUDA core does **one**. Each generation since has made them bigger and faster. Larger matrices are simply broken into tiles and fed to the tensor cores tile by tile.

### Why lower precision is the key

The second trick of tensor cores is **reduced precision**. First, a quick word on the names. **FP** stands for **floating point**, the standard way computers store numbers with decimals (a kind of scientific notation in binary), and the number after it is the total bits: FP32 uses 32 bits, FP16 uses 16, and so on. Each number is split into three parts:

```
FP32:  [sign 1 bit] [exponent 8 bits] [mantissa 23 bits]

sign      -> positive or negative
exponent  -> how big or small the number can be (the range)
mantissa  -> how many significant digits it keeps (the precision)
```

Fewer bits means less range, less precision, or both. You'll also meet **BF16** (*brain floating point*, invented at Google Brain) and **TF32** (*TensorFloat-32*, NVIDIA's own format): two formats that split their bits between exponent and mantissa differently, as we'll see below.

Neural networks turn out to be remarkably tolerant to noise: you don't need 32-bit floats to store a weight that will be nudged slightly in a random direction thousands of times anyway. Halving the number of bits means:

- half the memory and bandwidth per value,
- roughly a quarter of the silicon for a multiplier (multiplier area grows with the square of the mantissa width),
- so many more operations per clock in the same area and power.

Each generation of tensor cores has added support for lower-precision formats:

| Architecture | Year | Example GPU | Formats added |
|--------------|------|-------------|--------------------------------------|
| Volta        | 2017 | V100        | FP16 (with FP32 accumulate)          |
| Turing       | 2018 | RTX 20xx    | INT8, INT4 (for inference)           |
| Ampere       | 2020 | A100, RTX 30xx | TF32, BF16, 2:4 structured sparsity |
| Ada / Hopper | 2022 | RTX 40xx, H100 | FP8 (Transformer Engine on Hopper) |
| Blackwell    | 2024-25 | B200, RTX 50xx | FP4, FP6                      |

The new formats are **added**, not swapped in: a Blackwell tensor core still runs FP16, BF16, TF32, INT8 and FP8, and it simply runs FP4 too. (With few exceptions: INT4, for example, was dropped from datacenter chips starting with Hopper, since FP8 and FP4 do the job better.) There are no separate "FP16 cores" and "FP4 cores" either: the same tensor core handles all of them, and it gets faster as the numbers get smaller. Roughly, each time the precision is halved, the throughput doubles:

```
Same Blackwell tensor core, relative throughput:

TF32  (19 bits)   x0.5
FP16  (16 bits)   x1
FP8   (8 bits)    x2
FP4   (4 bits)    x4
```

The inputs can be tiny, but the results are usually **accumulated** in higher precision (FP16 or FP32), so the rounding errors don't pile up over thousands of additions. The programmer, or more often the framework like PyTorch, picks the format for each job: higher precision for training, where accuracy matters, and the lowest precision the model can tolerate for running it, where speed matters.

A couple of these deserve a word:

- **TF32** has the range of FP32 (8-bit exponent) but only a 10-bit mantissa. Its trick is that the tensor core accepts normal FP32 numbers and rounds them to TF32 internally, so code written for FP32 can use the tensor cores without being rewritten. Frameworks like PyTorch can turn this on with a single setting, for a big speedup at a precision loss most training doesn't notice.
- **BF16** keeps the 8-bit exponent of FP32 and only 7 mantissa bits. Same range as FP32, less precision, which is exactly the trade-off training wants (overflow is a much bigger problem than a little rounding).
- **2:4 structured sparsity**: if in every group of 4 weights at least 2 are zero, the tensor core can skip them and double its throughput.
- **FP4** (new on Blackwell) is just 4 bits per number: only 16 possible values! It works for running (not training) many models, with per-block scale factors to keep the accuracy acceptable, and it doubles throughput again compared to FP8.

On an RTX 5090 the plain FP32 CUDA cores deliver (as we calculated earlier) about **105 TFLOPS**, that is 105 trillion floating-point operations per second. NVIDIA markets the same card at **3,352 "AI TOPS (Trillions of Operations Per Second)"**, which is the tensor core throughput in FP4 with sparsity: about 30 times more. Even with the marketing tricks removed (no sparsity, higher precision), the tensor cores are many times faster than the CUDA cores. That's why every serious deep learning framework goes out of its way to express work as large matrix multiplies in low precision: it's the only path through the chip that runs at full speed.

Tensor cores are not idle silicon for gamers either: **DLSS** (NVIDIA's AI upscaling) runs a neural network on the tensor cores to reconstruct a high-resolution frame from a lower-resolution one, and with DLSS 4 on the 50 series, **Multi Frame Generation** uses them to generate up to three extra frames for every frame actually rendered.

Tensor cores are an example of a general rule: the more specialised the hardware, the faster it is at its one job. Bitcoin mining shows the extreme case. GPUs took over mining in its early years, because hashing billions of candidate blocks is perfectly parallel, but they were soon replaced by **ASICs**, chips that can compute *only* the SHA-256 hash and nothing else, thousands of times faster than a graphics card. CPU → GPU → tensor core → ASIC is a scale from flexible to specialised.

## Part 5: Binning, or How to Sell Broken Chips

Now to the most "business" part of chip design. Here's a surprising fact: the RTX 5090 does **not** use a complete GB202 chip. Out of 192 SMs, only **170** are enabled (about 88%), along with 96 MB of the 128 MB of L2 cache. And the same GB202 die is also sold in the **RTX PRO 6000 Blackwell**, a professional card with **188** SMs and 96 GB of memory, for several times the price. Why?

### Defects and yield

During manufacturing, patterning errors, dust particles and other small imperfections create **defective areas** on the chip. They land randomly across the wafer, so the bigger the chip, the more likely it is to catch at least one. With a typical defect rate for a mature process, the fraction of perfect dies (the **yield**) looks roughly like this:

| Die | Area | Perfect dies |
|------------------------------|----------|--------------|
| Small die (GB206, RTX 5060)  | 1.81 cm² | ~83%  |
| Medium die (GB203, RTX 5080) | 3.78 cm² | ~69%  |
| Big die (GB202, RTX 5090)    | 7.50 cm² | ~47%  |

So more than **half** of all GB202 dies would have at least one defect somewhere. And on a 300 mm wafer only around 70 of them fit. If you had to throw away every die with a single defect, high-end GPUs would cost a fortune (well, even more than they already do).

### The trick: redundancy by design

The solution is the **highly repetitive design** we saw earlier. A GPU is made of dozens of identical SMs, so a small defect in one core only damages that particular SM and doesn't affect the rest of the chip. Instead of throwing the chip away, engineers find the defective region and **permanently isolate and deactivate** the circuitry around it, by blowing tiny on-chip **eFuses** during testing, so the configuration can't be changed afterwards. The same applies to L2 cache slices and memory controllers.

The chips are then tested and categorised, or **binned**, according to how many working units they have. Because the defect can land anywhere, two RTX 5090s don't necessarily have the *same* SMs disabled, they just have the same *number* of working ones.

### One die, many products

NVIDIA designs a handful of dies of different sizes and then cuts each one into several products, depending on how many units survived (and on market demand). Here's the RTX 50 desktop lineup:

| Die | Full die SMs | Product | Active SMs | CUDA cores | Memory |
|-------|-----|-----------------------|-----|--------|---------------------|
| GB202 | 192 | RTX PRO 6000 (pro)    | 188 | 24,064 | 96 GB GDDR7, 512-bit |
|       |     | RTX 5090              | 170 | 21,760 | 32 GB GDDR7, 512-bit |
| GB203 | 84  | RTX 5080              | 84  | 10,752 | 16 GB GDDR7, 256-bit |
|       |     | RTX 5070 Ti           | 70  | 8,960  | 16 GB GDDR7, 256-bit |
| GB205 | 50  | RTX 5070              | 48  | 6,144  | 12 GB GDDR7, 192-bit |
| GB206 | 36  | RTX 5060 Ti           | 36  | 4,608  | 8/16 GB GDDR7, 128-bit |
|       |     | RTX 5060              | 30  | 3,840  | 8 GB GDDR7, 128-bit |
| GB207 | 20  | RTX 5050              | 20  | 2,560  | 8 GB GDDR6, 128-bit |

A few interesting things stand out:

- The **RTX 5080 is a flawless GB203**, all 84 SMs enabled, while GB203 dies with a few defects become 5070 Ti. Same chip, same memory bus, roughly a 20% difference in cores and a big difference in price.
- There is a **huge gap** between the 5090 (170 SMs) and the 5080 (84 SMs): GB202 is literally about twice the size of GB203.
- A common misconception is that a 5060 is just a "broken 5090". It isn't: they are completely different dies, and GB206 is less than a quarter of the size of GB202. Designing several dies is necessary because cutting a 750 mm² chip down to 30 SMs would mean selling a very expensive piece of silicon for 300 euros. But **within** each die family, binning is exactly what happens.

### Speed binning

Defects are not the only thing that varies. Even among fully working dies, some can reach higher clocks at lower voltage than others, due to tiny variations in the manufacturing process. Testing sorts them by this too:

- the best dies can go into higher-clocked or more power-efficient products (top SKUs, laptop chips where every watt counts),
- the others are sold at lower clocks.

This is also why the "silicon lottery" exists among overclockers: two cards of the same model can overclock very differently.

### Not only NVIDIA

Binning is universal in the semiconductor industry:

- **AMD Ryzen** CPUs are built from 8-core chiplets; a 6-core Ryzen 5 is very often an 8-core chiplet with two cores disabled.
- **Intel "F"** CPUs (like the i5-14400F) are chips where the integrated GPU is disabled, often because it was defective.
- The **PlayStation 5** and **Xbox Series X** ship with some GPU compute units disabled on purpose, so that chips with a defect can still be used and console production is not limited by yield.

### The uncomfortable part

As the process matures, defect density drops and more dies come out perfect. But the market still wants cheaper SKUs, so manufacturers sometimes take a perfectly good die and **disable working units** to sell it as a lower model. From a pure engineering point of view it sounds wasteful, but economically it's the same chip, with the same manufacturing cost, sold at different prices to different customers. The price of a GPU has little to do with how much it costs to make *that specific chip*, and a lot to do with how many working SMs it has and who wants to buy it.

## Conclusion

To recap:

- A **GPU** is the stadium, not the professor: it is built for throughput, with thousands of simple FMA calculators, fed by a very wide memory bus, hiding latency by switching between thousands of threads.
- The chip is a hierarchy of identical blocks: **GPCs → TPCs → SMs → processing blocks → CUDA cores**, and the SM is the real building block.
- Work is organised in **threads, warps of 32, thread blocks and grids**, and it shines on **embarrassingly parallel** problems like graphics and AI.
- **Tensor cores** compute small matrix multiply-accumulate operations all at once, at low precision, and they are the reason GPUs dominate AI.
- **Binning** turns imperfect silicon into a product lineup: the same die, with more or fewer SMs fused off, becomes a 5070 Ti or a 5080, a 5090 or an RTX PRO 6000.

So next time you see "21,760 CUDA cores" on a spec sheet, you'll know it means 170 SMs that survived testing out of 192, each juggling dozens of warps of 32 threads, with 4 little matrix engines doing most of the heavy lifting for AI.

As always, I hope you found this article helpful! :)
