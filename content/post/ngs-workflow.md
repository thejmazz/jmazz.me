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

We will be running a simple variant calling pipeline using a referenence genome and paired end genomic reads. For the sake of time when running the pipeline locally, we will use a small genome, *Salmonella enterica*, which has some paired end reads at about 100mb in size. With the reference genome at about 1.4mb, that provides about 70x coverage. 

[bionode-ncbi][bionode-ncbi] will be used to download the reads from the NCBI SRA, or *sequence read archive*. The reference could be downloaded with `bionode-ncbi download assembly $specie` , but at the moment there is a [bug][bionode-ncbi-bug] where that downloads the `rna_from_genomic` rather than `genomic` file for some species.

Once we have the an `sra` for *Salmonella enterica*, the next step is to generate the two `fastq` files for the two ended reads. Paired ends have a 5' $\rightarrow$ 3' set of reads and a 3' $\rightarrow$ 5' set of reads. This allows for much more confident alignment and is generally preferred over a single set of reads. For this we can use `fastq-dump` from [sra tools][sra-tools]:

```bash
fastq-dump --split-files --skip-technical --gzip reads.sra
```

This will produce `reads_1.fastq.gz` and `reads_2.fastq.gz`.

> fastq is essentially a fasta file that also includes **quality** scores. Quality scores are produced by the **base calling** methods employed by the given NGS machine. See the wikipedia pages for the [fasta format][fasta format] and the [fastq format][fastq format].

Filtering will be two step:

1. trim reads adapters with [trimmomatic][trimmomatic]

2. filter out bad [*k*-mers][k-mer] with 

   a) khmer

   b) kmc

This allows us to illustrate how much the pipeline tools let us swap in and out different tools for the same step (in this instance, khmer vs kmc) and then compare results. 

The filtering steps will complete by producing a `reads.filtered.fastq.gz` file. With other tools, it could have been a `reads_1.filtered.fastq.gz` and `reads_2.fastq.gz`.  It depends whether or not one of the filtering tools creates an *interleaved* file holding both read directions. It does not matter too much, as the next step can handle both cases. If we wanted to skip filtering, we could just use `reads_1.fastq.gz` and `reads_2.fastq.gz`.

Now we want to align the reads to the reference using [bwa][bwa] which is a [Burrows-Wheeler transform][Burrows-Wheeler transform] based alignment tool. First, an [FM-index][FM-index] needs to be constructed for the reference genome:

```bash
bwa index reference.genomic.fna.gz
```

Then we align using the reads, producing a *sequence alignment map*:

```bash
bwa mem reference.genomic.fna.gz reads.filtered.fastq.gz > reads.sam
```

We use [samtools][samtools] (also see [wiki/SAMtools][wiki/SAMtools]) to generate a *binary alignment map*:

```bash
samtools view -bh reads.sam  > reads.unsorted.bam
```

and sort it:

```bash
samtools sort reads.unsorted.bam -o reads.bam
```

> We could have piped the last three steps together, avoiding file writing/reading overhead:
>
> ```bash
> bwa mem ref reads | samtools view -bh - | samtools sort - -o reads.bam
> ```

and then index it (creates `reads.bam.bai` - *binary alignment index*):

```bash
samtools index reads.bam
```



At this point, we have everything we need to call variants:

```bash
samtools mpileup -uf reference.genomic.fna reads.bam | \
bcftools call -c - > reads.vcf
```

`mpileup` creates a BCF [pileup][pileup] file describing the base calls of aligned reads. Then `bcftools call` takes this and generates a [variant call format][vcf] file.

> Since `samtools` was complaining about the `reference.genomic.fna.gz` that comes from the NCBI Assemblies database - something to do with the compression format, I first decompressed it with:
>
> ```bash
> bgzip -d reference.genomic.fna.gz
> ```



Thats it! Thats how to get from SRA $\rightarrow$ VCF using bionode, sra tools, trimming tools, filtering tools, bwa, samtools, and bcftools. The next sections will go over how to improve the reproducibility, reentrancy, ease of development, etc. of this workflow. 

## bash

TODO

## make

TODO

## snakemake

TODO

## nextflow

TODO

## others

TODO

## Bionode Proposal

TODO

## Conclusion

TODO

[bionode-ncbi]: https://github.com/bionode/bionode-ncbi
[bionode-ncbi-bug]: https://github.com/bionode/bionode-ncbi/issues/19
[sra-tools]: https://github.com/ncbi/sra-tools
[fasta format]: https://en.wikipedia.org/wiki/FASTA_format
[fastq format]: https://en.wikipedia.org/wiki/FASTQ_format
[trimmomatic]: http://www.usadellab.org/cms/?page=trimmomatic
[khmer]: http://khmer.readthedocs.io/en/v2.0/
[k-mer]: https://en.wikipedia.org/wiki/K-mer
[bwa]: https://github.com/lh3/bwa
[FM-index]: https://en.wikipedia.org/wiki/FM-index
[Burrows-Wheeler transform]: https://en.wikipedia.org/wiki/Burrows%E2%80%93Wheeler_transform
[samtools]: https://github.com/samtools/samtools
[wiki/SAMtools]: https://en.wikipedia.org/wiki/SAMtools
[pileup]: https://en.wikipedia.org/wiki/Pileup_format
[vcf]: https://en.wikipedia.org/wiki/Variant_Call_Format