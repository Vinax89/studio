import React from 'react';
import { render } from '@testing-library/react';
import { Carousel } from '@/components/ui/carousel';
import type { Mock } from 'vitest'

const onMock = vi.fn();
const offMock = vi.fn();
type MockEmblaApi = {
  on: Mock;
  off: Mock;
  canScrollPrev: Mock;
  canScrollNext: Mock;
  scrollPrev: Mock;
  scrollNext: Mock;
};
let emblaApi: MockEmblaApi;

function mockUseEmbla() {
  emblaApi = {
    on: onMock,
    off: offMock,
    canScrollPrev: vi.fn().mockReturnValue(false),
    canScrollNext: vi.fn().mockReturnValue(false),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
  };
  return [vi.fn(), emblaApi];
}

vi.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: mockUseEmbla,
  useEmblaCarousel: mockUseEmbla,
}));

describe('Carousel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('removes event listeners on unmount', () => {
    const { unmount } = render(
      <Carousel>
        <div />
      </Carousel>
    );

    expect(onMock).toHaveBeenCalledWith('reInit', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('select', expect.any(Function));

    const listener = onMock.mock.calls[0][1];

    unmount();

    expect(offMock).toHaveBeenCalledWith('select', listener);
    expect(offMock).toHaveBeenCalledWith('reInit', listener);
  });
});
