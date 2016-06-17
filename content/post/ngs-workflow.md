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

## Topics

For each tool, we will inspect the following topics.

### Basic Structure

- quick intro to the tool, how it is written

### Iterative Development

- reentrancy
- error debugging

### Metrics

- time for each task
- resource usage
- reports

### Scaling

- extend to many species
- run on a cluster/cloud system
- distribute/reproducibility

## bash

The first obvious tool to use constructing a pipeline composed of a list of shell commands is a simple bash script. Essentially, we can take the commands from above and arrange them in a linear manner. You can see the full bash pipeline here: [basic-snp-calling.sh](https://github.com/bionode/gsoc16/blob/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-bash/basic-snp-calling.sh). 

### Basic Structure

The above section introduced the tools and their commands required to run a simple variant calling pipeline. However, all of the file names were hardcoded: `reference.genomic.fna.gz`, `reads.fastq.gz`, etc. In a real analysis, we would like to generalize so that we can provide paramaters defining the specie and reads to use. Then, for example, we can run the pipeline over many species and inspect related hypotheses. Within a bash script we can attempt to carry this out using *environment variables*. Depending on how these variables are defined, they may be accessible from different places. For example, the `PATH` variable (try `echo $PATH`) in your shell is available all the time. This is because it was defined using `export`. Without `export`, a variable is only available within in its current context. Consider:

*main.sh*

```bash
#!/bin/bash
READS_ID=2492428 # no spaces around =!
./downloadReads.sh
```

*downloadReads.sh*

```bash
#!/bin/bash
bionode-ncbi download sra $READS_ID
```

In this case, `READS_ID` will evaluate to blank. Alternatively you need to `export READS_ID=2492428` to have the variable available in other contexts. This is important to make note of, because complex shell scripts will likely be split across multiple files, in which case it is important to understand when and when not to use `export`. *Blindly using export everywhere is not recommended.*

With an understanding of environment variables out of the way, we can use them to define some initial settings for the script:

```bash
# Salmonella enterica
REFERENCE_NAME='GCA_000006945.2_ASM694v2'
REFERENCE="${REFERENCE_NAME}_genomic.fna.gz"
REFERENCE_URL="http://ftp.ncbi.nlm.nih.gov/genomes/all/$REFERENCE_NAME/$REFERENCE"
READS='2492428'
export READSFQ='ERR1229296'
FILTER_MODE='khmer' # 'kmc', 'none'
```

`READSFQ` is defined with `export` so it can be available from the filter scripts which have been separated out from the main file. Then files used as input and output can be described with these variables:

```bash
echo "START fastq-dump"
fastq-dump --split-files --skip-technical --gzip $READS/**.sra
echo "END fastq-dump"
```

I also notify the start and end of each task, *manually*. This is cumbersome and cluttering, and adding more useful features like time taken would be even more messy. Up until the filtering, the pipeline is completely linear. However, we would like to filter using two tools: `khmer` and `kmc`. One is significantly faster, but may produce more erroneous results. But that does not mean its useless, it can be useful to favour speed and number of species over specificity at the expense of less trials. Ideally, the swap from fast to slow should be a simple swap. As well, it can be useful to compare where exactly the two methods differ in their results. Enter the `if [ condtion ]; then … fi` block:

```bash
if [ $FILTER_MODE == 'kmc' ]; then
  if [ ! -d $TMPDIR ]; then
    mkdir -p $TMPDIR
  fi
  echo "START filtering with kmc"
  export READS_TO_ALIGN="$READSFQ.trim.pe.kmc.fastq.gz"
  ./filter_kmc.sh
  echo "END filtering with kmc"
elif [ $FILTER_MODE == 'khmer' ]; then
  echo "Using khmer mode"
  export READS_TO_ALIGN="$READSFQ.trim.pe.khmer.fastq.gz"
  ./filter_khmer.sh
  FINAL_OUTPUT="${READS}-khmer.vcf"
else
  echo "No filter mode set. Continuing with reads with adapters trimmed."
  READS_TO_ALIGN="$READSFQ.trim.pe.fastq.gz"
fi
```

At this point, the pipeline branches into two modes. Currently, if we wanted to switch filter modes, we have to edit the definition of `FILTER_MODE` and restart the pipeline. If we are not checking for file existence before each command, this will be a big time waste. You can imagine how even deeper branching options can complicate it more. As well, it can be useful to change tool parameters and inspect the effects on final results. As an annoyance, changing these settings requires editing the file every time: this script would not scale to 100s of species well.

After the filtering, the final section, alignment and calling, uses a variable set by the filtering option used to determine which reads to align with and the name of the final output. We can run the pipeline two times, wasting time, but at least the final results do not overwrite each other. 

### Iterative Development

Iterative development is the practice of developing a pipeline peice by peice. It is important because these pipelines can take a long time to run and simply running from scratch every time something needs to be changed is unnacceptable. In a bash script it can be handled by placing
```bash
#!/bin/bash
set -e # exits script when an error is thrown

...

exit 1
```
throughout the script. As well, I particulary enjoy [this][r-exec-atom] plugin, with it you can cmd+enter to send the current line or text selection to a terminal. However, there are still some remaining issues with this process. If you want to skip over previous steps, perhaps downloading reads or indexing, you will need to add explicit checks to your code. This clutters the code, and may still be error prone, as simply checking for a files existence might not be enough: it could be a 404 html document rather than a set of reads.

### Metrics

Any metrics you might want - time per task, cpu time per task, cpu and memory usage, would all have to be written manually. You could write a function to wrap commands and time them, etc, but this still clutters the code, obstructing the main message. Furthermore, "in house" metrics gathering is prone to error, especially when running on different machines. You may want to develop on a Mac and then deploy to a Linux server, where some commands may be different.

Any sort of report on the pipeline performance, whether it be a text file or styled HTML document, would again require in house coding.

### Scaling

Bash scripts are not scalable. If we were to port the script to handle multiple species, we *could use* bash arrays:

```bash
nums=(1 2 3 4 5); for i in $nums; do echo $i; done
```

The above script might work for pipelines which only take one input parameter for a specie, but we also need the reference URL, SRA ID, etc. Going one step further, we can use array indices to gather related data. Yet the syntax is not the cleanest:

```bash
species=(Salmonella-enterica Staphylococcus-aureus)
readsID=(2492428 1274026)

for i in "${!species[@]}"; do 
    printf "%s\t%s\t%s\n" $i ${species[$i]} ${readsID[$i]}
done
```

However, this would probably involve multiple code changes throughout the script. When deviating from the original purpose, bash scripts are likely to require relatively large codebase fixes. Changing species from a string to an array will break a lot of things.

Furthermore, changing settings like maximum threads and memory usage will require manually editing the script when on the cluster, versus other tools which can provide this a command line option. Of course, *you could parse your own params*, but that is a lot of manual work.

In terms of reproducibility, there is not much. The script will likely assume all dependencies are installed. It may assume required binaries are in a specific place (in my script I used the `BIN` variable for this). It may also even fail on systems with different commands. It may also even assume being in a certain directory and directory structures of the system. 

## make

`make` and `Makefile` are old, well known tools that are normally used for C/C++ compilation. The complete `Makefile` is [here](https://github.com/bionode/gsoc16/blob/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-make/Makefile). 

### Basic Structure

With `make`, the pipeline can be made a little more cleaner, particularly with respect to *input* and *output* from each command. A `makefile` is composed of rules:

```make
rule <target>: <prerequisites...>
	<command>
```

Make will run the rules that have targets for a given set of prerequisites. Consider:

```bash
rule all: genome

rule chromosome_1:
	echo ATCG > chromosome_1

rule chromosome_2:
	echo GATA > chromosome_2

rule genome: chromosome_1 chromosome_2
	cat chromosome_1 chromsome_2 > genome
```

If you trace the execution, it will first go into the first rule (which is named `all` by convention). The first rule states it requires `genome`. The third rule is capable of producing `genome` as that is its target, yet it requires two other prerequisites. So then rules that have `chromosome_*` in their target are used, these have no prereqs and can run right away. Then the program "unwinds" and everything works its way back to `rule all`. To learn more about `make` I highly recommend [this gist][make-gist] This technique, where pipelines are defined from the end-to-forwards, we will refer to as the **pull** method.

We can handle branching using set variables to enforce ignoring some rules:

```bash
# Toggle these variable declarations to switch between

# 1. no trimming/filtering
# PRECONDITION_TO_USE=fastq-dump.log
# READS_1=reads_1.fastq.gz
# READS_2=reads_2.fastq.gz

# 2. kmc
# PRECONDITION_TO_USE=reads.trim.pe.kmc.fastq.gz
# READS_1=reads.trim.pe.kmc.fastq.gz

# 3. khmer
PRECONDITION_TO_USE=reads.trim.pe.khmer.fastq.gz
READS_1=reads.trim.pe.khmer.fastq.gz
```

And the corresponding rule which will invoke a given path in the branch:

```bash
reads.sam: bwa-index.log ${PRECONDITION_TO_USE}
	@echo "=== Running $@ ==="
	@export start=`date +%s`; \
	bwa mem -t ${THREADS} reference.genomic.fna.gz ${READS_1} ${READS_2} > $@; \
	export end=`date +%s`; \
	export runtime=$$(($$end-$$start)); \
	echo "Target $@ took $$runtime seconds"
```

### Iterative Development

Iterative development in `make` is much improved over a `bash` script. This is because you can call a specific rule at invocation: `make reads.sam` for example. As well, it is common practice to include a clean rule. It is possible in `make` to define targets that don't actually create the target file. Since the target is not actually created (even though the command in that rule has ran and worked as expected), since make skips rules if the target already exists, it will unnecessarily rerun the rule. My general workflow writing a `make` pipeline was to update the prequisite of `rule all` as new rules were added, and each task from before would be skipped. One way to get around this issue is to create "flag files":

```bash
trim.happened: fastq-dump.log
	@echo "=== Running $@ ==="
	@export start=`date +%s`; \
	java -jar ${TRIMMOMATIC} PE -phred33 \
	  reads_1.fastq.gz reads_2.fastq.gz \
	  reads_1.trim.pe.fastq.gz reads_1.trim.se.fastq.gz \
	  reads_2.trim.pe.fastq.gz reads_2.trim.se.fastq.gz \
	  ILLUMINACLIP:${ADAPTERS}/TruSeq3-PE.fa:2:30:10 \
	  LEADING:3 TRAILING:3 SLIDINGWINDOW:4:20 MINLEN:36 > $@; \
	export end=`date +%s`; \
	export runtime=$$(($$end-$$start)); \
	cat $@; \
	echo "Target $@ took $$runtime seconds"
```

Here, the stdout of trimmomatic is sent to `trim.happened`. Even if there is no stdout, an empty file will get made, and then the next run this rule can be skipped.

### Metrics

To get time spent metrics, I wrapped each command in a simple delta time calculation:

```bash
time:
	@echo "=== Running $@ ==="
	@export start=`date +%s`; \
	sleep 2; \
	export end=`date +%s`; \
	export runtime=$$(($$end-$$start)); \
	echo "Target $@ took $$runtime seconds"
```

This clutters the code fast, and is unmaintainable. It might be possible to do it cleaner, but I did not spend time trying obscure solutions. TODO link to SO question, bash function to wrap and time? The point is that there is no "out of the box" way to get task metrics with `make`. You can imagine how tricky it might be to also get RAM/CPU usage for each task.

TODO use make wildcarding.

### Scaling

Scaling with make is also difficult. There is no easy way to expand the pipeline to multiple species, and it is difficulty to "variabilize" outputs: targets need to strings.

## snakemake

The `Makefile` was much more organized than the bash script, but still of "a low level".

Snakemake was a refreshing take on the make style, but with many more features and powered by a high level language. Including Python integration everywhere, tasks to script in Python, Bash, and R, and some metrics out of the box. As well as some neat wildcarding. The complete Snakefile is [here](https://github.com/bionode/gsoc16/blob/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-snakemake/Snakefile).

### Basic Structure

You start a Snakemake workflow very similar to a Makefile, defining a global rule and what you want it to create:

```python
rule all:
    input: FINAL_FILES
```

So what is `FINAL_FILES`? Since Snakemake has direct Python integration, we can actually compute it as a local variable. Heres the header for the `Snakefile` just before

`rule all`:

```python
species = {
    'Salmonella-enterica': {
        'readsID': '2492428',
        'reference_url': 'http://ftp.ncbi.nlm.nih.gov/genomes/all/GCA_000988525.2_ASM98852v2/GCA_000988525.2_ASM98852v2_genomic.fna.gz'
    }
}

THREADS=2
TEMP='./tmp'

FINAL_FILES = [specie+'.vcf' for specie in species]
```

This will end up with `FINAL_FILES` being `['Salmonella-enterica.vcf']`.  See this rule which will be one of the first in the executed pipeline (here I hardcoded the specie name to better illustrate):

```python
rule all:
    input: 'Salmonella-enterica.vcf'

rule download_sra:
    output: '{specie}.sra'
    run:
        readsID = species[wildcards.specie]['readsID']
        shell('''
            bionode-ncbi download sra {readsID};
            cp {readsID}/*.sra {output} && rm -rf {readsID};
        ''')       
        
rule call:
    input: '{specie}.sra'
    output: '{specie}.vcf'
    shell: 'magic {input} > {output}'
```

The first rule will be triggered and will be looking for another rule that has `Salmonella-enterica.vcf` in its `output`. It won't find *exactly* that, but because of Snakemake's wildcarding, `{specie}.vcf` will do (from `rule call`), and then within the `call` rule, the value of `wildcards.specie` will be `Salmonella-enterica`. Then it will move onto `download_sra`. This example also illustrates how you can use `run` and `shell()` to mix Python and shell code. You can also use `script` to run a Python or R script, and use the `R()` function to execute R code in a rule.

Another neat feature with Snakemake is the ability to drop in "wrappers":

```python
rule bwa_mem:
    input:
        ref = '{specie}.genomic.fna.gz',
        sample = ['{specie}_'+num+'.fastq.gz' for num in ['1', '2']],
        index_files = ['{specie}.genomic.fna.gz.'+suffix for suffix in ['amb', 'ann', 'bwt', 'pac', 'sa']]
    log: 'logs/bwa_mem/{specie}.log'
    output: '{specie}.sam'
    threads: THREADS
    wrapper: '0.0.8/bio/bwa_mem'
```

These wrappers come from the [wrappers repository][wrappers-repository]. They run predefined commands using specific input variables. While this is great, there is some overhead in having to check the source to see what is actually happening, and by extension, you then need an internet connection to do so. There does not seem to be a huge list of wrappers, it is too bad it does not seem to have caught on extensively.

Still have the problem of using log/flag files for task dependency, but less so, since you can define "custom" outputs, also has touch(flag) built in

Could not figure out how to ecomical branching, wildcard regexes create ambiguity:

![attempt-branching](https://raw.githubusercontent.com/bionode/gsoc16/fdf22b630e33dd11302ea8822c547ef9399c3ea4/pipelines/with-snakemake/dag.png)

Here it unnecessarily redoes certain steps. This is because `Salmonella-enterica.trim.vcf` and `Salmonella-enterica.trim.vcf` both match `{specie}.vcf`. At first, Snakemake complained about ambiguous rules due to this conflict. I was able to generate the DAG above by using custom regexes for the wildcard in a few rules: `{specie,[a-zA-z-]+}`. However, since this then creates one set of rules with `wildcard.specie = Salmonella-enterica` and another with `wildcard.specie = Salmonella-enterica.trim`, and then that wildcard moves all the way to the first rule, and basically two pipelines are ran. I was not able to figure out how optimize this using Snakemake - if anyone can, let me know!

Moreover - because the **pull** workflow style depends on *targets* and *prerequisites*, it can be difficult to achieve a branch-merge pipeline. We will see with Nextflow, which follows the dataflow paradigm, or **push**, it is natural to describe such pipelines.

For a more complicated (and real world) snakemake setup, take a look at [pachterlab/kallisto_paper_analysis/Snakefile][https://github.com/pachterlab/kallisto_paper_analysis/blob/nbt/Snakefile].

### Iterative Development

Iterative development in Snakemake is about the same as with `make`. With wildcarding, the clean rule can be made more specific, for example:

```python
rule clean:
    input: '{specie}.vcf'
    shell: '''
    	rm {specie}.sra {specie}.bam;
    '''
```

As opposed to `rm *.sra *.bam`. 

### Metrics

You can opt in to store rule benchmarks and logs:

```python
rule call:
    input:
        bam = '{specie}.bam',
        alignment_index = '{specie}.bam.bai',
        reference = '{specie}.genomic.fna'
    output: '{specie}.vcf'
    log: 'logs/call/{specie}.log'
    benchmark: 'benchmarks/call/{specie}.txt'
    shell: 'samtools mpileup -uf {input.reference} {input.bam} | bcftools call -c - > {output}'
```

However, you will need to make sure you name these files appropiately to avoid overwriting. An example benchmark file looks like:

```
s	h:m:s
30.32477617263794	0:00:30.324776
```

There is no indication of which task the benchmark is for, meaning if you want a comprehensive report of your pipeline you will need to write a script that concatenates the benchmarks in the correct order.

With graphviz installed, snakemake can create a plot of the DAG for your pipeline:

```bash
snakemake --dag | dot -Tpng > dag.png
```

You can see an example of this above.

### Scaling

With Snakemake it is easy to scale to multiple species. In my Snakefile, I simply just add more keys to the `species` dictionary. Since each output file is prefixed by the species name, there will be no file overlaps. You need to be vigilant with output names and ensure yourself there will be no conflicts.

You can specify clustering configuration by writing a `cluster.config` file and using its values in the call to Snakemake. The example [from the documentation](https://bitbucket.org/snakemake/snakemake/wiki/Documentation#markdown-header-cluster-configuration):

*Snakefile*

```python
rule all:
    input: "input1.txt", "input2.txt"

rule compute1:
    output: "input1.txt"
    shell: "touch input1.txt"

rule compute2:
    output: "input2.txt"
    shell: "touch input2.txt"
```

*cluster.json*

```json
{
    "__default__" :
    {
        "account" : "my account",
        "time" : "00:15:00",
        "n" : 1,
        "partition" : "core"
    },
    "compute1" :
    {
        "time" : "00:20:00"
    }
}
```

And the call to Snakemake:

```
snakemake -j 999 --cluster-config cluster.json --cluster "sbatch -A {cluster.account} -p {cluster.partition} -n {cluster.n}  -t {cluster.time}"
```

While nextflow is providing a simple config based way to pass params into your clustering command, the actual command: `sbatch` is written manually. We will say with Nextflow, even this aspect of clustering is abstracted away (into "executor"). See also [job properties](https://bitbucket.org/snakemake/snakemake/wiki/Documentation#markdown-header-job-properties) to see how to write a generic job wrapper for clustering.

## nextflow

Nextflow is a more recent tool, and approaches the workflow problem in a **push** sense. Similar to how Snakemake allows direct Python integration, Nextflow uses [Groovy](http://www.groovy-lang.org/). While Snakemake let you write rules with inline Python, R, and shell, in Nextflow, you *can use any scripting language*. See [main.nf](https://github.com/bionode/gsoc16/blob/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-nextflow/main.nf) for the complete pipeline.

Nextflow follows the [dataflow programming paradigm](https://en.wikipedia.org/wiki/Dataflow_programming) (push) which is also called [stream processing](https://en.wikipedia.org/wiki/Stream_processing) or [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming). While in Snakemake you define `rule all`'s prerequisites, and then "work backwards" from there (pull), in the dataflow model you can think and write in the order that tasks will happen. Since the push model does not depend on inferring a complete dependency tree at the initialization, you can introduce dynamic structures into the pipeline. For example, choosing between two tasks to run *based on the output* of a previous task. One fallback with the push model is that since it can be dynamic, it is difficult to then perform a "dry run", or generate a DAG ahead of time.

### Basic Structure

Nextflow uses **processes** as rules, and each process will occur in its own folder in `/work`. Since each process takes place in its own folder, using output from one task as input in another cannot be done the "conventional way". But that is alright, because Nextflow provides **channels** to communicate between processes. 

Consider:

```groovy
#!/usr/bin/env nextflow

species = [
  'Salmonella-enterica': [
    'referenceURL': 'http://ftp.ncbi.nlm.nih.gov/genomes/all/GCA_000988525.2_ASM98852v2/GCA_000988525.2_ASM98852v2_genomic.fna.gz',
    'readsID': '2492428'
  ]
]

process downloadSRA {
  container 'bionode/bionode-ncbi'

  input: val readsID from species.collect { it.value.readsID }
  output: file '**/*.sra' into reads

  """
  bionode-ncbi download sra $readsID > tmp
  """
}

process extractSRA {
  container 'inutano/sra-toolkit'

  input: file read from reads
  output: file '*.fastq.gz' into samples

  """
  fastq-dump --split-files --skip-technical --gzip $read
  """
}
```

See the documentation on [processes] for more. As well, there are more types of channels than `val` and `file`, see [channels]. If you are new to [Groovy], and `species.collect { it.value.readsID }` confuses you, think of it as `species.map(specie => specie.value.readsID)`.  It is important to note that while channels may appear confusing at first (why not just use filenames?), they are an elegant solution to a problem we had with Snakemake: file name overlap. With Nextflow, you can be guarenteed no files will ever overwrite each other (unless you do so yourself in one process). As well, this abstracts away the filename, making commands appear generalized:

```groovy
process indexReference {
  container 'biodckr/bwa'

  input: file reference from referenceGenomeGz2
  output: file '*.gz.*' into referenceIndexes

  """
  bwa index $reference
  """
}
```

There is no mental overhead from managing `{specie}.genomic.fna.gz`, instead we can simply use the variable `$reference`. This makes the commands in our processes easy to read and comprehend. We can even "hardcode" output file names in an *extremely general way* without any fear of file overlap:

```groovy
process decompressReference {
  container 'biodckrdev/htslib'

  input: file referenceGenome from referenceGenomeGz1
  output: file 'reference.genomic.fna' into referenceGenomes

  """
  bgzip -d $referenceGenome --stdout > reference.genomic.fna
  """
}
```

Here we output to `reference.genomic.fna`. A filename that would surely cause problems in any other worflow system.

Something else to discuss with Nextflow is how to handle a channel being consumed by multiple processes. Since a channel is a FIFO queue in Nextflow, once one process uses it, it is "emptied" and cannot be consumed by another process. The way to get around this is to create the original channel called `myOutput` and then "clone" it via `into` $n$ channels to be consumed by $n$ processes:

```groovy
process downloadReference {
  container true

  input: val referenceURL from species.collect { it.value.referenceURL }
  output: file 'reference.genomic.fna.gz' into referenceGenomeGz

  """
  appropriate/curl $referenceURL -o reference.genomic.fna.gz
  """
}

// fork reference genome into three other channels
( referenceGenomeGz1,
  referenceGenomeGz2,
  referenceGenomeGz3 ) = referenceGenomeGz.into(3)
```

This is also an example of an *executable container*, where the Dockerfile ends in `CMD ["curl"]`. 

However, I encountered some issues when trying to dockerize everything. TODO talk about dockerizing processes in a pipe.

Finally, wherease Snakemake only allowed Python and R inside rules, with Nextflow you can use any scripting language.

### Iterative Development

Iterative developmen with Nextflow is much improved over the other tools. I felt as though I could extend the pipeline, adding new processes, without having to worry about updating a `rule all` rule, or cleaning up old files. Nextflow seamlessly recognizes cached process' results when given the `-resume` flag.

Debugging errors in processes works great. When an error occurs, you can `cd` into the relevant `/work` directory, and Nextflow provides log files, and a file that describes which command exactly was ran. This allows you to debug the error in the same environment as it will be ran, and then resume the workflow from that point.

### Metrics

Nextflow can create timeline charts:

![nextflow-timeline](https://github.com/bionode/gsoc16/raw/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-nextflow/timeline.png)

and a DAG diagram of the pipeline (also notice I was able to create a "forking" pipeline unlike with Snakemake):

![nextflow-workflow](https://github.com/bionode/gsoc16/raw/543ba66cbb42d1622089764bf01090e318307a57/pipelines/with-nextflow/workflow.png)

### Scaling

You might have noticed the `container` [directive][nextflow-directive] in the above processes. Nextflow comes with built-in docker integration, which is great. *Each process can run in its own container*. This helps improve the portability and reproducibiltiy of the workflow. All a consumer needs installed on their system is Docker and Nextflow (and you can even run Nextflow in Docker). Each container can use a tagged version, ensuring when someone else runs the pipeline, they are using the *exact same version of each tool*. You could, of course use Docker in your Snakemake commands, but there would be overhead from volume mounting (mapping a local folder to a folder inside the container); Nextflow handles all that for you. As well, Nextflow has built in support for many cluster engines, which can be enabled by defining the `executor` in `nextflow.config`. Another feature to not is Nextflow's integration with GitHub. With a `main.nf` in your repo, you can run a pipeline with `nextflow run username/repo`. 

Finally, be sure to check out [awesome-nextflow](https://github.com/nextflow-io/awesome-nextflow)!

## others

- [awesome-pipeline](https://github.com/pditommaso/awesome-pipeline)
- [luigi](https://github.com/spotify/luigi) and [sciluigi](https://github.com/pharmbio/sciluigi)
- [airflow](https://github.com/apache/incubator-airflow)
- [toil](https://github.com/BD2KGenomics/toil)
- [bcbio](https://github.com/chapmanb/bcbio-nextgen)
- [example gulpfile simple pipeline](https://github.com/pachterlab/kallisto/blob/master/gulpfile.js)
- [scipipe](https://github.com/scipipe/scipipe)
- [node-datapumps](https://github.com/agmen-hu/node-datapumps)

## Conclusion

On a scale from 1-5, these are my ratings for each tool. Mostly as relative to each other, rather than absolutely.

| Tool      | Structure | Iterative Dev. | Metrics | Scale | Reproducibility |
| --------- | --------- | -------------- | ------- | ----- | --------------- |
| bash      | 1         | 1              | 1       | 1     | 1               |
| make      | 2         | 2              | 1       | 1     | 1               |
| Snakemake | 4         | 3              | 3       | 4     | 4               |
| Nextflow  | 4         | 5              | 5       | 5     | 4               |

I have not investigated the "others" from above to warrant their ranking.

A quick summary:

**bash**

- "generic" scripting
- simple variable interpolation - `$foo`
- no metrics, difficult to scale
- no reentrancy, poor iterative development

**make**

- structure more pipeline oriented than bash - tasks with *input* (prerequisites) and *output* (target)
- introduces some element of reentrancy by skipping rules whose target already exists = improved iterative development over bash
- can "fork" by defining variables that change a rule's prerequisites, and running again
- no metrics, difficult to scale

**Snakemake**

- enhanced scripting over bash/make with Python while using make's well known rules structure
- improved `{input}`, `{output}` syntax and power (e.g. `{input.a}` or `{input[n]}`) over make
- run Python, shell, or R in rule
- enhanced wildcarding: easier to understand, more powerful than make's `%`
- benchmarks are OK - need to do manual work to get a full pipeline report
- DAG is nice
- dry run is nice (and possible because of "pull" paradigm)
- can scale to multiple species easily, just need to make sure file names do not overlap
- cannot create forking paths (e.g. use same reference for two different filtering tools). Could do it by changing `FINAL_OUTPUT` and running again, but then thats basically the same as it was in `make`. (again, if you know how to do this without wildcarding ambiguity - let me know!)

**Nextflow**

- dataflow paradigm - "push"
- as a consequence of push, no dry run
- as a consequence of push, flexible forking and dynamic pipelines
- scale to multiple species effortlessly with no overlapping file name concerns
- timeline, DAG, benchmarks metrics are all very nice
- Docker is nice - improves reproducibility and shareability
- cannot handle large `stdout | stdin` pipes across channels (e.g. one process for `bwa mem` and another for `samtools view`)

**bionode-waterwheel** *proposal*

- no DSL to learn - just JavaScript. Functional, built around async, events, and streams.

- streams resonate well with *push* paradigm

- support for piping `stdin`, `stdout` around, e.g. `bwa.mem().pipe(samtools.view())` . This enhances modularity of pipeline, rather than having one rule or process doing `bwa mem | samtools view`, which is really two commands, each deserving their own input, output, parameter definitions. This can aid in improving reproducibility and modularity, as tools with defined input, output, params could be confidentally dropped into the pipeline.

- moduler interoperation with web apps, native apps (Electron), services (Slack, email). Imagine pipeline logs being sent over a websocket to your browser.

- interoperation with npm ecosystem

- integrate with CWL spec

- metrics will be easier to consume since output will be JSON to be consumed by d3, browser apps, etc

- modular, specific, customizable waterwheel "backend" can be integrated into browser or native apps, bringing more power to pipeline GUIs than Galaxy for instance, where it is complicated to develop a custom pipeline (some labs hire someone to create a custom xml config for their specific pipeline so that the wet lab can "click to play" in Galaxy)

- variable interpolation - like ES6 template literals, which can take any valid JS expression:

  ```javascript
  const PORT = config.PORT
  const template = `Server listening on port ${PORT}`
  ```

  which can actually evaluate any JS expression:

  ```javascript
  [1, 2, 3, 4].map(num => `is even: ${num % 2 === 0 ? 'true' : 'false'}`)
  ```



- simple examples with small datasets can be browser compatibile (see: [nbind](https://github.com/charto/nbind)). Live browser examples are great for education - "run your own NGS pipeline, from the browser"
- how to handle interative development is an open question. Can fork all streams into files for reentrancy while in a "develop" mode. 



A draft pipeline with **bionode-waterwheel**:

```javascript
const ncbi = require('bionode-ncbi')
const wrapper = require('bionode-wrapper')
const waterwheel = require('bionode-waterwheel')

const { task, join, run } = waterwheel
const { stdout, stdin, file, directory } = waterwheel.types

// Can be passed in from CLI
// params for final pipeline call. params are things that do not
// change how items are passed between processes, but decide output for the
// pipeline as a whole. For example, species name and reads accession.
const pipelineParams = {
  specie: 'Salmonella-enterica',
  readsID: '2492428',
  output: 'Salmonella-enterica.vcf'
}

const sra = task({
  output: stdout()
}, ncbi.download('sra', '{params.readsID}'))

const reference = task({
  output: stdout()
}, ncbi.download('assembly', '{params.specie}'))
const bwa_index = task({
  input: file(),
  output: file()
}, wrapper('bwa index {input}'))


// some tools you cannot decide output file
// so, tell waterwheel to stream a file as stdout
// there is --stdout for fastq-dump to give a streamed fastq, but trimmomatic
// wants reads_1 and reads_2
// tools that are not bionode will need to wrapper()ed
const extract = task({
  input: file('reads.sra'),
  output: file([1, 2].map(n => `reads_${n}.fastq.gz`))
}, wrapper('fastq-dump --split-files --skip-technical --gzip {input}'))

const trim = task({
  input: file([1, 2].map(n => `reads_${n}.fastq.gz`)),
  output: {
    pe: file([1, 2].map(n => `reads_${n}.trim.pe.fastq.gz`),
    se: file([1, 2].map(n => `reads_${n}.trim.se.fastq.gz`)
  },
  opts: {
    adapters: '../adapters'
  }
}, wrapper('''
  trimmomatic PE -phred33 \
  {input[0]} {input[1]} \
  {output.pe[0]} {output.se[0]} \
  {output.pe[1]} {output.se[1]} \
  ILLUMINACLIP:{opts.adapters}/TruSeq3-PE.fa:2:30:10 \
  LEADING:3 TRAILING:3 SLIDINGWINDOW:4:20 MINLEN:36 \
'''))

const merge = task({
  input: file(),
  output: stdout()
}, wrapper('seqtk mergepe {input}'))

const gzip = task({
  input: stdin(),
  output: stdout()
}, wrapper('gzip - > {output}'))

// Branching: these two filtering types produce the same type of output
// So we can pass an array, and define them both under the same input/output
const filter = task({
  input: file()
  output: file()
  opts: {
    tmpDir: directory()
  }
}, [wrapper('''
  kmc -k{params.KMERSIZE} -m{params.MEMORYGB} -t{params.THREADS} {input} reads.trim.pe.kmc {opts.tmp} \
  kmc_tools filter reads.trim.pe.kmc -cx{params.MINCOVERAGE} {input} -ci0 -cx0 {output} \
'''), wrapper('''
  load-into-counting.py -N 4 -k {params.KMERSIZE} -M {params.MEMORYGB}e9 -T {params.THREADS} reads.trim.pe.fastq.gz.kh {input} \
  abundance-dist.py reads.trim.pe.fastq.gz.kh {input} reads.trim.pe.fastq.gz.kh.hist \
  filter-abund.py -T {params.THREADS} -C ${MINCOVERAGE} reads.trim.pe.fastq.gz.kh -o {output} {input} \
''')])

// file() dependencies will stop stream.
// for example, need to wait on an index file to be made before aligning
const bwa_mem = task({
  input: {
    reference: file(),
    index: file(), // check for reference indexing
    sample: file() // output of filter
  }
  output: stdout()
}, wrapper('bwa mem {input.reference} {input.sample}'))

// This is where streams in Node can really show
// In snakemake or Nextflow, this would be bwa mem | samtools view
// Which is less modular, reproducible, containerizable
const samtools_view = task({
  input: stdin(),
  output: stdout()
}, wrapper('samtools view -Sbh {input}'))

const samtools_sort = task({
  input: stdin(),
  output: stdout()
}, wrapper('samtools sort {input}'))

const samtools_index = task({
  input: stdin(),
  output: stdout()
}, wrapper('samtools index {input}'))

// these will all get piped through each other:
// bwa_mem().pipe(samtools_view()).pipe(samtools_sort()).pipe(samtools_index())
const align = join([bwa_mem, samtools_view, samtools_sort, samtools_index])

const samtools_mpileup = task({
  input: {
    bam: file(),
    index: file(),
    reference: file()
  },
  output: stdout()
}, wrapper('samtools mpileup -uf {input.bam} {input.reference}'))

const bcftools_call = task({
  input: stdin(),
  output: stdout()
}, wrapper('bcftools call -c {input}'))

const callVariants = join([samtools_mpileup, bcftools_call])

// need a way to use output of another task as input for this one
const pipeline = join(
  [sra, extract, trim, merge],
  // this creates a branching
  filter,
  align,
  callVariants
)

// Run the whole pipeline, passing in params
run(pipelineParams, pipeline).pipe(task(fs.createWriteStream('{output}')))
```

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
[atom-r-exec]: https://atom.io/packages/r-exec
[make-gist]: https://gist.github.com/isaacs/62a2d1825d04437c6f08
[nextflow-processes]: http://www.nextflow.io/docs/latest/process.html
[nextflow-channels]: http://www.nextflow.io/docs/latest/channel.html
[nextflow-groovy]: http://www.nextflow.io/docs/latest/script.html
[nextflow-directive]: http://www.nextflow.io/docs/latest/process.html#directives
[wrappers-repository]: https://bitbucket.org/snakemake/snakemake-wrappers