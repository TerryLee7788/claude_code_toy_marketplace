import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterSheet from "./FilterSheet";

const openSheet = async () => {
  const user = userEvent.setup();
  const onApplyFilter = vi.fn();
  render(
    <FilterSheet onApplyFilter={onApplyFilter}>
      <button>Open Filters</button>
    </FilterSheet>
  );

  await user.click(screen.getByRole("button", { name: "Open Filters" }));
  await screen.findByText("Sort Products");

  return { user, onApplyFilter };
};

describe("FilterSheet", () => {
  it("does not show sheet content until the trigger is clicked", () => {
    render(
      <FilterSheet onApplyFilter={vi.fn()}>
        <button>Open Filters</button>
      </FilterSheet>
    );

    expect(screen.queryByText("Sort Products")).not.toBeInTheDocument();
  });

  it("opens the sheet with default sort options selected", async () => {
    await openSheet();

    expect(screen.getByRole("radio", { name: "Date Added" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Newest First" })).toBeChecked();
  });

  it("respects currentSortBy and currentSortOrder props", async () => {
    const user = userEvent.setup();
    render(
      <FilterSheet
        onApplyFilter={vi.fn()}
        currentSortBy="price"
        currentSortOrder="asc"
      >
        <button>Open Filters</button>
      </FilterSheet>
    );

    await user.click(screen.getByRole("button", { name: "Open Filters" }));
    await screen.findByText("Sort Products");

    expect(screen.getByRole("radio", { name: "Price" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Low to High" })).toBeChecked();
  });

  it("swaps order labels to price wording when Price is selected", async () => {
    const { user } = await openSheet();

    expect(screen.getByText("Newest First")).toBeInTheDocument();
    expect(screen.getByText("Oldest First")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Price" }));

    expect(screen.getByText("High to Low")).toBeInTheDocument();
    expect(screen.getByText("Low to High")).toBeInTheDocument();
    expect(screen.queryByText("Newest First")).not.toBeInTheDocument();
  });

  it("calls onApplyFilter with the selected sort options and closes the sheet", async () => {
    const { user, onApplyFilter } = await openSheet();

    await user.click(screen.getByRole("radio", { name: "Price" }));
    await user.click(screen.getByRole("radio", { name: "Low to High" }));
    await user.click(screen.getByRole("button", { name: "Apply Filter" }));

    expect(onApplyFilter).toHaveBeenCalledTimes(1);
    expect(onApplyFilter).toHaveBeenCalledWith("price", "asc");

    await waitFor(() =>
      expect(screen.queryByText("Sort Products")).not.toBeInTheDocument()
    );
  });

  it("does not call onApplyFilter until the button is clicked", async () => {
    const { onApplyFilter } = await openSheet();

    expect(onApplyFilter).not.toHaveBeenCalled();
  });
});
