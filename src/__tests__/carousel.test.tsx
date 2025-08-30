import React from 'react';
import { render } from '@testing-library/react';
import { Carousel } from '@/components/ui/carousel';

jest.mock('lucide-react', () => ({
  ArrowLeft: () => null,
  ArrowRight: () => null,
}));

const onMock = jest.fn();
const offMock = jest.fn();
type MockEmblaApi = {
  on: jest.Mock;
  off: jest.Mock;
  canScrollPrev: jest.Mock;
  canScrollNext: jest.Mock;
  scrollPrev: jest.Mock;
  scrollNext: jest.Mock;
};
let emblaApi: MockEmblaApi;

function mockUseEmbla() {
  emblaApi = {
    on: onMock,
    off: offMock,
    canScrollPrev: jest.fn().mockReturnValue(false),
    canScrollNext: jest.fn().mockReturnValue(false),
    scrollPrev: jest.fn(),
    scrollNext: jest.fn(),
  };
  return [jest.fn(), emblaApi];
}

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: mockUseEmbla,
  useEmblaCarousel: mockUseEmbla,
}));

describe('Carousel', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
