import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specProfile } from "@/test/spec-samples";
import { ProfileGreeting } from "./profile-greeting";

const PROFILE_URL = "*/api/customers/:customerId/profile";

function renderGreeting() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <ProfileGreeting dayPart="morning" today="2024-09-16">
        <p>Data as of 16 Sep 2024</p>
      </ProfileGreeting>
    </QueryClientProvider>,
  );
}

function answerProfileWith(...responses: (() => Response)[]) {
  let calls = 0;
  server.use(
    http.get(PROFILE_URL, () => {
      const respond = responses[Math.min(calls, responses.length - 1)];
      calls += 1;
      return respond ? respond() : HttpResponse.json(specProfile);
    }),
  );
  return () => calls;
}

describe("ProfileGreeting", () => {
  it("shows the greeting words and a placeholder for the name while loading", () => {
    renderGreeting();
    expect(screen.getByText(/Good morning,/)).toBeInTheDocument();
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it("greets by first name in a paragraph, not a heading", async () => {
    renderGreeting();
    const greeting = await screen.findByText("Good morning, John");
    expect(greeting.closest("p")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(greeting).toHaveAttribute("tabindex", "0");
  });

  it("describes the greeting with the profile tooltip", async () => {
    renderGreeting();
    const greeting = await screen.findByText("Good morning, John");
    expect(greeting).toHaveAccessibleDescription("John Doe · Premium · Customer since 15 Jan 2023");
  });

  it("shows the tooltip on focus and hides it on Escape, keeping focus", async () => {
    renderGreeting();
    await screen.findByText("Good morning, John");
    await userEvent.tab();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByText("Good morning, John")).toHaveFocus();
  });

  it("hides the tooltip when focus moves away", async () => {
    renderGreeting();
    await screen.findByText("Good morning, John");
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the tooltip on hover, keeps it while the pointer is on it, and hides it after leaving both", async () => {
    renderGreeting();
    const greeting = await screen.findByText("Good morning, John");
    await userEvent.hover(greeting);
    const tooltip = screen.getByRole("tooltip");
    await userEvent.hover(tooltip);
    expect(screen.getByRole("tooltip")).toBeVisible();
    await userEvent.unhover(tooltip);
    await userEvent.unhover(greeting);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("hides a hover-only tooltip on Escape", async () => {
    renderGreeting();
    await userEvent.hover(await screen.findByText("Good morning, John"));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("when the profile fails, greets without a name and offers Retry under the date line", async () => {
    answerProfileWith(() => HttpResponse.json({}, { status: 500 }));
    renderGreeting();
    expect(await screen.findByText("Couldn't load profile")).toBeInTheDocument();
    expect(screen.getByText("Good morning")).toBeInTheDocument();
    const dateLine = screen.getByText("Data as of 16 Sep 2024");
    const errorLine = screen.getByText("Couldn't load profile");
    expect(dateLine.compareDocumentPosition(errorLine)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("Retry asks for the profile again and then greets by name", async () => {
    const calls = answerProfileWith(
      () => HttpResponse.json({}, { status: 500 }),
      () => HttpResponse.json(specProfile),
    );
    renderGreeting();
    await userEvent.click(await screen.findByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Good morning, John")).toBeInTheDocument();
    expect(calls()).toBe(2);
  });

  it("treats a profile for another customer as an error and shows none of it", async () => {
    answerProfileWith(() => HttpResponse.json({ ...specProfile, customerId: "99999" }));
    renderGreeting();
    expect(await screen.findByText("Couldn't load profile")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("John");
  });

  it("never shows the customer ID, email or lifetime spend", async () => {
    renderGreeting();
    await screen.findByText("Good morning, John");
    await waitFor(() => expect(document.body).not.toHaveTextContent("12345"));
    expect(document.body).not.toHaveTextContent("john.doe@email.com");
    expect(document.body).not.toHaveTextContent("15420");
  });
});
