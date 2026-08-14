from datasets import load_dataset

try:
    ds = load_dataset("starsofchance/PrimeVul", split="test")
    print(ds[0])
except Exception as e:
    print(e)
    ds = load_dataset("colin/PrimeVul", split="test")
    print(ds[0].keys())
