import os
import sys

EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.css'}

def analyze_file(filepath):
    total_lines = 0
    blank_lines = 0
    comment_lines = 0
    code_lines = 0
    
    in_block_comment = False
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            total_lines += 1
            stripped = line.strip()
            
            if not stripped:
                blank_lines += 1
                continue
                
            if in_block_comment:
                comment_lines += 1
                if '*/' in stripped:
                    in_block_comment = False
                continue
                
            if stripped.startswith('/*'):
                comment_lines += 1
                if '*/' not in stripped:
                    in_block_comment = True
                continue
                
            if stripped.startswith('//'):
                comment_lines += 1
                continue
                
            code_lines += 1
            
    return {
        'total': total_lines,
        'blank': blank_lines,
        'comment': comment_lines,
        'code': code_lines
    }

def scan_directory(root_dir, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build', '.system_generated', 'scratch'}
        
    stats = {
        'files': 0,
        'total': 0,
        'blank': 0,
        'comment': 0,
        'code': 0,
        'by_ext': {}
    }
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in EXTENSIONS:
                fpath = os.path.join(root, f)
                fstats = analyze_file(fpath)
                stats['files'] += 1
                stats['total'] += fstats['total']
                stats['blank'] += fstats['blank']
                stats['comment'] += fstats['comment']
                stats['code'] += fstats['code']
                
                if ext not in stats['by_ext']:
                    stats['by_ext'][ext] = {'files': 0, 'code': 0, 'total': 0}
                stats['by_ext'][ext]['files'] += 1
                stats['by_ext'][ext]['code'] += fstats['code']
                stats['by_ext'][ext]['total'] += fstats['total']
                
    return stats

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    base_dir = os.path.join(repo_root, "data", "code", "HealthCare-Doctor-Appointment-Management-System")
    evolved_dir = os.path.join(repo_root, "Part2", "code")
    
    base_stats = scan_directory(base_dir)
    evolved_stats = scan_directory(evolved_dir)
    
    # Analyze Part 2 newly added modules
    modules = {
        'CH01 Video (Adapter)': os.path.join(evolved_dir, "lib", "video"),
        'CH02 Availability (Strategy)': os.path.join(evolved_dir, "lib", "availability"),
        'CH03 Events & Reminders (Observer)': [
            os.path.join(evolved_dir, "lib", "events"),
            os.path.join(evolved_dir, "lib", "reminders")
        ],
        'API Endpoints': [
            os.path.join(evolved_dir, "app", "api", "video"),
            os.path.join(evolved_dir, "app", "api", "reminders")
        ],
        'Part2 Test Suite': os.path.join(evolved_dir, "tests")
    }
    
    print("=" * 80)
    print("CAREPULSE SOURCE CODE LINE-OF-CODE (LOC) METRICS AUDIT")
    print("=" * 80)
    print(f"Baseline Directory: {base_dir}")
    print(f"Evolved Directory:  {evolved_dir}")
    print("-" * 80)
    print(f"{'Metric':<25} | {'Baseline (Original)':<20} | {'Evolved (Part 2)':<20} | {'Delta (+/-)':<10}")
    print("-" * 80)
    print(f"{'Source Files Count':<25} | {base_stats['files']:<20} | {evolved_stats['files']:<20} | {evolved_stats['files'] - base_stats['files']:+<10}")
    print(f"{'Total Physical Lines':<25} | {base_stats['total']:<20} | {evolved_stats['total']:<20} | {evolved_stats['total'] - base_stats['total']:+<10}")
    print(f"{'Source Code (SLOC)':<25} | {base_stats['code']:<20} | {evolved_stats['code']:<20} | {evolved_stats['code'] - base_stats['code']:+<10}")
    print(f"{'Comment Lines':<25} | {base_stats['comment']:<20} | {evolved_stats['comment']:<20} | {evolved_stats['comment'] - base_stats['comment']:+<10}")
    print(f"{'Blank Lines':<25} | {base_stats['blank']:<20} | {evolved_stats['blank']:<20} | {evolved_stats['blank'] - base_stats['blank']:+<10}")
    print("-" * 80)
    
    print("\nBREAKDOWN BY EXTENSION (EVOLVED):")
    for ext, s in sorted(evolved_stats['by_ext'].items()):
        base_ext = base_stats['by_ext'].get(ext, {'files': 0, 'code': 0, 'total': 0})
        print(f"  {ext:<6}: Files: {s['files']} (+{s['files'] - base_ext['files']}) | SLOC: {s['code']} (+{s['code'] - base_ext['code']}) | Total: {s['total']} (+{s['total'] - base_ext['total']})")
        
    print("\nBREAKDOWN OF PART 2 NEW MODULES:")
    for mod_name, paths in modules.items():
        if isinstance(paths, str):
            paths = [paths]
        mod_stat = {'files': 0, 'code': 0, 'comment': 0, 'total': 0}
        for p in paths:
            st = scan_directory(p)
            mod_stat['files'] += st['files']
            mod_stat['code'] += st['code']
            mod_stat['comment'] += st['comment']
            mod_stat['total'] += st['total']
        print(f"  {mod_name:<35}: Files: {mod_stat['files']:<3} | SLOC: {mod_stat['code']:<5} | Comments: {mod_stat['comment']:<4} | Total Lines: {mod_stat['total']}")

if __name__ == '__main__':
    main()
