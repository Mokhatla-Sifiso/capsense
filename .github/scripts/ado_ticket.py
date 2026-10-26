import html
import re
import sys

from ado_common import ado


def text(value: str | None) -> str:
    value = re.sub(r"<li>", "\n- ", value or "")
    value = re.sub(r"</(p|h\d|tr|li|div)>|<br\s*/?>", "\n", value)
    value = re.sub(r"<img[^>]*>", "[design screenshot]", value)
    return html.unescape(re.sub(r"<[^>]+>", "", value)).strip()


def main(work_item: str) -> None:
    fields = ado("GET", f"wit/workitems/{int(work_item)}?api-version=7.1")["fields"]
    print(f"# AB#{work_item} {fields.get('System.Title', '')}\n")
    print(f"Type: {fields.get('System.WorkItemType')} · State: {fields.get('System.State')}\n")
    print("## Description\n\n" + text(fields.get("System.Description")) + "\n")
    if fields.get("Microsoft.VSTS.Common.AcceptanceCriteria"):
        print("## Acceptance criteria\n\n" + text(fields["Microsoft.VSTS.Common.AcceptanceCriteria"]))


if __name__ == "__main__":
    main(sys.argv[1])
