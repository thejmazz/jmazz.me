---
date: 2016-06-08T12:27:27-04:00
draft: true
title: ngs workflows
---

# NGS Workflows

*Next generation sequencing*. We all know that a fundamental practice in bioinformatics is the analysis of biological sequences. Similarities, functions, structures, associations, transcripts, proteins, RNA interference, regulation, interaction, DNA binding, the list goes on. Much can be hypothesized given some ATCGs (and some annotations). 

However, its **not plug and play**.  Various tools and algorithms exists for each step in NGS data pipelines. Each with their own advantages and disadvantages for a given set of data (e.g. bacterial vs. eukaryotic genomes TODO ref, expand). Their underlying algorithms can make assumptions which may not be true in all cases. New tools and methods are being developed and there are **rarely adopted standards**. Researchers today regularly construct hardcoded and unmaintanable scripts. I am not calling out these individuals on their coding practice, but rather positing that scripts without community maintained modular dependencies, with dependence on a specific environment configuration - let alone hardcoded absolute file references, are by their nature **unfit for providing reproducible NGS workflows to the community at large**. But hey, it [![works badge](https://cdn.rawgit.com/nikku/works-on-my-machine/v0.2.0/badge.svg)](https://github.com/nikku/works-on-my-machine) right?

A well written **bash script** *can* be version controlled, and dependencies *can* be described, however the consumer *may* not be able to achieve an identical environment. At the very least, it will be a painful setup process.  Similarly, a **python script** is definitely more elegant and modular, but still suffers from issues such as pipeline reentrancy. One popular old tool is **make**, which can improve reentrancy by defining *rules* which have a *target* (output) and *input*s. However, the syntax is not newcomer friendly and file pattern matching can be confusing or limited. 

Not all hope is lost. There are have been many great efforts approaching this issue. One is **snakemake** which defines an elegant python-esque makefile with filename wildcarding, support for inline Python and R, and more. Another is **nextflow**, which goes a step further and describes pipelines through isolated (and containerizable) *process* blocks which communicate through channels. As well there are extras like **galaxy**, **luigi**, TODO add more.

In this blog post, I will define a simple variant calling pipeline. Then walk through the implementation of this pipeline using these four technologies:

1. bash
2. make
3. snakemake
4. nextflow

Then discuss other alternatives in brief. Finally I will propose where Bionode and JavaScript can fit into this ecosystem, and which specific issues can be addressed.

TODO introduce, explain problem better.

## Variant Calling Pipeline

TODO

## bash

TODO

## make

TODO

## snakemake

TODO

## nextflow

TODO

## Honourable Mentions

TODO

## Bionode Proposal

TODO

## Conclusion

TODO

