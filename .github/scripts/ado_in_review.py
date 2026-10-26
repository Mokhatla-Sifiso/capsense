import json
import subprocess
import sys

from ado_common import ado

LABEL = "ai-review:done"


def in_review_ids() -> set[int]:
    ids: set[int] = set()
    iterations = ado("GET", "work/teamsettings/iterations?$timeframe=current&api-version=7.1", team=True)["value"]
    for iteration in iterations:
        board = ado("GET", f"work/taskboardworkitems/{iteration['id']}?api-version=7.1-preview.1", team=True)["value"]
        ids |= {item["workItemId"] for item in board if item.get("column") == "In Review"}
    wiql = {"query": "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.BoardColumn] = 'In Review'"}
    ids |= {item["id"] for item in ado("POST", "wit/wiql?api-version=7.1", wiql)["workItems"]}
    return ids


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def main() -> None:
    ids = in_review_ids()
    print(f"In Review work items: {sorted(ids) or 'none'}")
    for work_item in sorted(ids):
        prs = json.loads(gh("pr", "list", "--state", "open", "--search", f"AB#{work_item} in:body", "--json", "number,labels,isDraft"))
        for pr in prs:
            labels = {label["name"] for label in pr["labels"]}
            if pr["isDraft"] or LABEL in labels:
                continue
            gh("pr", "edit", str(pr["number"]), "--add-label", LABEL)
            gh("workflow", "run", "claude-review.yml", "-f", f"pr_number={pr['number']}", "-f", f"work_item={work_item}")
            print(f"Dispatched review: PR #{pr['number']} for AB#{work_item}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        print(error.stderr, file=sys.stderr)
        raise
