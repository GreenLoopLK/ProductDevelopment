import subprocess

def run_git(args):
    git_path = r"C:\Users\BIG PP\AppData\Local\GitHubDesktop\app-3.6.1\resources\app\git\cmd\git.exe"
    res = subprocess.run([git_path] + args, capture_output=True, text=True, cwd=r"C:\Users\BIG PP\OneDrive\Documents\GitHub\Greenloop")
    return res.stdout

commits = run_git(["log", "--format=%H %s"]).strip().split('\n')
print(f"Total commits: {len(commits)}")
for commit in commits[:10]:
    h, s = commit.split(' ', 1)
    # Check if this commit modified script.js
    diff = run_git(["show", h, "--", "script.js"])
    if "wheel" in diff or "deltaY" in diff:
        print(f"Commit {h[:7]} ({s}) contains wheel modifications.")
        # Print the wheel-related lines in show
        for line in diff.split('\n'):
            if "wheel" in line.lower() or "deltay" in line.lower() or "scrollto" in line.lower() or "currentcardindex" in line.lower():
                print("  ", line[:120])
