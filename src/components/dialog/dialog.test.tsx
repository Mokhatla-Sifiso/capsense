import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

function renderDialog() {
  render(
    <Dialog title="About this demo" trigger={<svg aria-hidden />} triggerLabel="Help" triggerClassName="" closeIcon="×">
      <p>Read-only</p>
    </Dialog>,
  );
}

describe("Dialog", () => {
  it("has a trigger that says it opens a dialog", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Help" })).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("opens as a modal named by its title", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Help" }));
    const dialog = screen.getByRole("dialog", { name: "About this demo" });
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveTextContent("Read-only");
  });

  it("closes from its close button and hands focus back to the trigger", async () => {
    renderDialog();
    await userEvent.click(screen.getByRole("button", { name: "Help" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Help" })).toHaveFocus();
  });
});

describe("Dialog options", () => {
  it("leaves out the close button when no close icon is given", async () => {
    render(
      <Dialog title="Custom range" trigger="Custom range" triggerClassName="">
        <p>Dates</p>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Custom range" }));
    expect(screen.getByRole("dialog", { name: "Custom range" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("tells its owner each time it opens", async () => {
    const onOpen = vi.fn();
    render(
      <Dialog title="Custom range" trigger="Custom range" triggerClassName="" onOpen={onOpen}>
        <p>Dates</p>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Custom range" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
