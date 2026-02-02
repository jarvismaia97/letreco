interface Props {
  message: string;
}

export default function Toast({ message }: Props) {
  if (!message) return null;

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-toast">
      <div className="bg-base-content text-base-100 px-5 py-3 rounded-lg font-bold text-sm shadow-lg">
        {message}
      </div>
    </div>
  );
}
