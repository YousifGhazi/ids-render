import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

export function BooleanState({
  state,
  trueProps,
  falseProps,
}: {
  state: boolean;
  trueProps?: React.ComponentProps<typeof IconCircleCheck>;
  falseProps?: React.ComponentProps<typeof IconCircleX>;
}) {
  return state ? (
    <IconCircleCheck color="green" size={30} {...trueProps} />
  ) : (
    <IconCircleX color="red" size={30} {...falseProps} />
  );
}
