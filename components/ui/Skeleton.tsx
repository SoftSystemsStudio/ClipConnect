interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  const roundedClass = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedClass} ${className}`}
      style={{ width, height }}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton width={40} height={40} rounded="full" />
        <div className="flex-1">
          <Skeleton height={16} width="50%" className="mb-2" />
          <Skeleton height={12} width="30%" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonProfileCard() {
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton width={64} height={64} rounded="full" />
          <div>
            <Skeleton height={20} width={120} className="mb-2" />
            <Skeleton height={14} width={80} />
          </div>
        </div>
        <Skeleton height={32} width={80} rounded="md" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton height={24} width={60} rounded="full" />
        <Skeleton height={24} width={60} rounded="full" />
        <Skeleton height={24} width={60} rounded="full" />
      </div>
    </div>
  );
}

export function SkeletonPostCard() {
  return (
    <div className="bg-white border rounded p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton width={32} height={32} rounded="full" />
        <Skeleton height={14} width={100} />
      </div>
      <Skeleton height={200} className="mb-3" rounded="lg" />
      <SkeletonText lines={2} />
      <div className="flex gap-4 mt-3">
        <Skeleton height={20} width={50} />
        <Skeleton height={20} width={50} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'profile' | 'post' }) {
  const Component = {
    card: SkeletonCard,
    profile: SkeletonProfileCard,
    post: SkeletonPostCard,
  }[type];

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
