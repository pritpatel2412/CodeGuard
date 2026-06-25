import os
import json
import difflib
import random
from datasets import load_dataset

OUTPUT_DIR = os.path.join(os.getcwd(), 'eval', 'tier-b-corpus')
METHODOLOGY_FILE = os.path.join(OUTPUT_DIR, 'SELECTION_METHODOLOGY.md')

def main():
    print("Loading PrimeVul dataset...")
    try:
        ds = load_dataset("colin/PrimeVul", split="test")
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        # Note: If environment/networking limits prevent Hugging Face access, we fall back to a manual statement.
        print("Network restriction prevented PrimeVul download. Stating limitation for Tier B.")
        write_limitation_methodology()
        return

    print("Dataset loaded! Sampling 30-50 pairs...")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Filter for valid pairs
    df = ds.to_pandas()
    
    # Some basic filtering
    # PrimeVul has 'func_before', 'func_after', 'cve', etc. 
    # Try to find columns
    cols = df.columns.tolist()
    print("Columns:", cols)
    
    func_before_col = 'func_before' if 'func_before' in cols else 'code_before' if 'code_before' in cols else cols[0]
    func_after_col = 'func_after' if 'func_after' in cols else 'code_after' if 'code_after' in cols else cols[1]
    
    # Let's assume it has 'project' and 'cwe' or similar
    
    sample_indices = random.sample(range(len(df)), min(40, len(df)))
    
    case_count = 0
    for idx in sample_indices:
        row = df.iloc[idx]
        
        before_code = str(row.get(func_before_col, ""))
        after_code = str(row.get(func_after_col, ""))
        
        if not before_code or not after_code or before_code == after_code:
            continue
            
        cve = str(row.get('cve', row.get('id', row.get('vul_id', f"PrimeVul-{idx}"))))
        repo = str(row.get('project', row.get('repo', "unknown/repo")))
        cwe_list = str(row.get('cwe', row.get('cwes', '[]')))
        
        # Generate a synthetic diff patch
        diff_lines = list(difflib.unified_diff(
            before_code.splitlines(keepends=True),
            after_code.splitlines(keepends=True),
            fromfile='a/vuln.c',
            tofile='b/vuln.c',
            n=3
        ))
        diff_text = "".join(diff_lines)
        
        if not diff_text or len(diff_text) < 20:
            continue
            
        case_id = f"case-{str(case_count + 1).zfill(3)}"
        
        case_dir = os.path.join(OUTPUT_DIR, case_id)
        os.makedirs(case_dir, exist_ok=True)
        
        with open(os.path.join(case_dir, 'diff.patch'), 'w', encoding='utf-8') as f:
            f.write(diff_text)
            
        with open(os.path.join(case_dir, 'label.json'), 'w', encoding='utf-8') as f:
            json.dump({
                "cve": cve,
                "category": "PrimeVul-Sample",
                "source_url": "https://huggingface.co/datasets/colin/PrimeVul",
                "repo": repo,
                "cwes": [cwe_list]
            }, f, indent=2)
            
        case_count += 1
        print(f"[+] Added {case_id}: {cve} from {repo}")
        
    write_success_methodology(case_count)

def write_limitation_methodology():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(METHODOLOGY_FILE, 'w') as f:
        f.write("# Tier B: Academic Benchmark (PrimeVul)\n\n")
        f.write("Due to environment/networking limitations, downloading the full PrimeVul dataset via Hugging Face failed. ")
        f.write("Rather than substituting an easier, non-academic dataset, we are stating this limitation explicitly. ")
        f.write("Tier B evaluation could not be completed mechanically.\n")
        
def write_success_methodology(count):
    with open(METHODOLOGY_FILE, 'w') as f:
        f.write("# Tier B: Academic Benchmark Selection Methodology\n\n")
        f.write("This corpus was randomly sampled from the **PrimeVul** C/C++ dataset via Hugging Face to provide a rigorous, academic baseline comparison.\n\n")
        f.write("## Rules Applied\n")
        f.write("1. **Source**: `colin/PrimeVul` via Hugging Face `datasets`.\n")
        f.write("2. **Diff Generation**: Synthetic unified diffs were generated locally by comparing `func_before` and `func_after`.\n")
        f.write(f"\nTotal Cases Sampled: {count}\n")
        
if __name__ == "__main__":
    main()
