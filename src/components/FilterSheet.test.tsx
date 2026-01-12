import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FilterSheet from './FilterSheet';
import { SortBy, SortOrder } from '@/hooks/usePublicProducts';

describe('FilterSheet', () => {
  const mockOnApplyFilter = vi.fn();
  const defaultProps = {
    children: <button>Open Filter</button>,
    onApplyFilter: mockOnApplyFilter,
  };

  beforeEach(() => {
    mockOnApplyFilter.mockClear();
  });

  it('renders trigger children correctly', () => {
    render(<FilterSheet {...defaultProps} />);
    expect(screen.getByText('Open Filter')).toBeInTheDocument();
  });

  it('opens sheet when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    expect(screen.getByText('Sort Products')).toBeInTheDocument();
  });

  it('displays default sort options', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Check sort by options
    expect(screen.getByLabelText('Date Added')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();

    // Check sort order options
    expect(screen.getByLabelText('Newest First')).toBeInTheDocument();
    expect(screen.getByLabelText('Oldest First')).toBeInTheDocument();
  });

  it('sets initial values from props', async () => {
    const user = userEvent.setup();
    render(
      <FilterSheet
        {...defaultProps}
        currentSortBy="price"
        currentSortOrder="asc"
      />
    );

    await user.click(screen.getByText('Open Filter'));

    // Price should be selected
    expect(screen.getByLabelText('Price')).toBeChecked();

    // Low to High should be selected (asc for price)
    expect(screen.getByLabelText('Low to High')).toBeChecked();
  });

  it('updates sort by selection', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Initially created_at should be selected (default)
    expect(screen.getByLabelText('Date Added')).toBeChecked();

    // Click on Price
    await user.click(screen.getByLabelText('Price'));

    expect(screen.getByLabelText('Price')).toBeChecked();
    expect(screen.getByLabelText('Date Added')).not.toBeChecked();
  });

  it('updates sort order selection', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Initially desc should be selected (default)
    expect(screen.getByLabelText('Newest First')).toBeChecked();

    // Click on Oldest First (asc)
    await user.click(screen.getByLabelText('Oldest First'));

    expect(screen.getByLabelText('Oldest First')).toBeChecked();
    expect(screen.getByLabelText('Newest First')).not.toBeChecked();
  });

  it('shows correct labels for price sorting', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Select Price
    await user.click(screen.getByLabelText('Price'));

    // Labels should change to price-specific labels
    expect(screen.getByLabelText('High to Low')).toBeInTheDocument();
    expect(screen.getByLabelText('Low to High')).toBeInTheDocument();
  });

  it('shows correct labels for date sorting', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} currentSortBy="price" />);

    await user.click(screen.getByText('Open Filter'));

    // Select Date Added
    await user.click(screen.getByLabelText('Date Added'));

    // Labels should change to date-specific labels
    expect(screen.getByLabelText('Newest First')).toBeInTheDocument();
    expect(screen.getByLabelText('Oldest First')).toBeInTheDocument();
  });

  it('calls onApplyFilter with correct values when Apply button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Change to price sorting
    await user.click(screen.getByLabelText('Price'));
    await user.click(screen.getByLabelText('Low to High'));

    // Click Apply Filter
    await user.click(screen.getByText('Apply Filter'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith('price', 'asc');
  });

  it('calls onApplyFilter with default values when no changes are made', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Click Apply Filter without making changes
    await user.click(screen.getByText('Apply Filter'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith('created_at', 'desc');
  });

  it('closes sheet when Apply Filter is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    expect(screen.getByText('Sort Products')).toBeInTheDocument();

    await user.click(screen.getByText('Apply Filter'));

    // Sheet should close
    await waitFor(() => {
      expect(screen.queryByText('Sort Products')).not.toBeInTheDocument();
    });
  });

  it('applies correct CSS classes and styling', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Check that the sheet content has expected classes
    const sheetContent = screen.getByText('Sort Products').closest('[role="dialog"]');
    expect(sheetContent).toHaveClass('bg-background', 'border-t', 'border-border');

    // Check button styling
    const applyButton = screen.getByText('Apply Filter');
    expect(applyButton).toHaveClass('w-full', 'bg-secondary', 'text-secondary-foreground', 'font-orator');
  });

  it('handles complex user interactions', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    await user.click(screen.getByText('Open Filter'));

    // Change to price, then back to date
    await user.click(screen.getByLabelText('Price'));
    await user.click(screen.getByLabelText('Date Added'));

    // Change sort order
    await user.click(screen.getByLabelText('Oldest First'));

    await user.click(screen.getByText('Apply Filter'));

    expect(mockOnApplyFilter).toHaveBeenCalledWith('created_at', 'asc');
  });

  it('maintains internal state when reopening the sheet', async () => {
    const user = userEvent.setup();
    render(<FilterSheet {...defaultProps} />);

    // First interaction - change selection but don't apply
    await user.click(screen.getByText('Open Filter'));
    await user.click(screen.getByLabelText('Price'));

    // Close without applying by pressing Escape key
    await user.keyboard('{Escape}');

    // Reopen sheet
    await user.click(screen.getByText('Open Filter'));

    // Internal state persists - Price should still be selected
    expect(screen.getByLabelText('Price')).toBeChecked();
  });

  describe('accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      const user = userEvent.setup();
      render(<FilterSheet {...defaultProps} />);

      await user.click(screen.getByText('Open Filter'));

      // Check that radio groups have proper labels
      expect(screen.getByText('Sort by')).toBeInTheDocument();
      expect(screen.getByText('Order')).toBeInTheDocument();

      // Check that radio buttons have proper labels
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('id');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<FilterSheet {...defaultProps} />);

      await user.click(screen.getByText('Open Filter'));

      // Focus the first radio button directly
      const dateAddedRadio = screen.getByLabelText('Date Added');
      dateAddedRadio.focus();
      expect(document.activeElement).toBe(dateAddedRadio);

      // Use space or enter to select, then navigate
      await user.keyboard(' '); // Space to select
      expect(screen.getByLabelText('Date Added')).toBeChecked();

      // Navigate to next radio button and select
      await user.keyboard('{ArrowDown}');
      await user.keyboard(' ');
      expect(screen.getByLabelText('Price')).toBeChecked();
    });
  });

  describe('edge cases', () => {
    it('handles undefined currentSortBy prop', async () => {
      const user = userEvent.setup();
      render(
        <FilterSheet
          {...defaultProps}
          currentSortBy={undefined}
          currentSortOrder={undefined}
        />
      );

      await user.click(screen.getByText('Open Filter'));

      // Should default to created_at and desc
      expect(screen.getByLabelText('Date Added')).toBeChecked();
      expect(screen.getByLabelText('Newest First')).toBeChecked();
    });

    it('handles invalid prop values gracefully', async () => {
      const user = userEvent.setup();
      render(
        <FilterSheet
          {...defaultProps}
          currentSortBy={'invalid' as SortBy}
          currentSortOrder={'invalid' as SortOrder}
        />
      );

      await user.click(screen.getByText('Open Filter'));

      // Should still render without crashing
      expect(screen.getByText('Sort Products')).toBeInTheDocument();
    });
  });
});