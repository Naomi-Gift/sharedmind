import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#080c0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
          <path
            d="M11 1L20.526 6.5V17.5L11 23L1.474 17.5V6.5L11 1Z"
            stroke="#00e87a"
            strokeWidth="1.5"
            fill="rgba(0,232,122,0.15)"
          />
          <circle cx="11" cy="11" r="3" fill="#00e87a" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
