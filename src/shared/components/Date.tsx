import * as React from "react";

type Props = {
  timestamp: number;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Date: React.FC<Props> = ({ timestamp }: Props) => {
  const date = new global.Date(timestamp);
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return <>{`${day} ${month} ${year}`}</>;
};

export default Date;
