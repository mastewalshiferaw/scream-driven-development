export default function CRTOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 crt-lines" />
      <div className="absolute inset-0 crt-vignette" />
    </div>
  );
}