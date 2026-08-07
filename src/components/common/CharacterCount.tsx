interface CharacterCountProps {
  current: number;
  max: number;
}

export default function CharacterCount({ current, max }: CharacterCountProps) {
  return (
    <p className="mt-2 text-right text-xs text-gray-400">
      {current}/{max}
    </p>
  );
}
