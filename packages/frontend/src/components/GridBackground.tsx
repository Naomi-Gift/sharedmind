export default function GridBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Fine grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,232,122,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,232,122,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Phosphor bloom — top left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(0,232,122,0.05) 0%, transparent 65%)' }}
      />
      {/* Gold bloom — bottom right */}
      <div
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(240,180,41,0.04) 0%, transparent 65%)' }}
      />
      {/* Vignette */}
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,12,10,0.7) 100%)' }} />
    </div>
  );
}
