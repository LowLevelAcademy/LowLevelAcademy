// This module contains components that are used for representing numbers in different number systems.

import React, { useState } from "react";
import styles from "./index.module.scss";

// Component that allows to input only numeric values.
const NumericInput = (props) => (
  <input
    type="text"
    inputMode={props.inputMode || "numeric"}
    pattern={props.pattern}
    size={props.size || 4}
    value={props.value}
    onChange={(event) => {
      if (event.target.value.length == 0) {
        props.onChange("0");
      } else if (event.target.validity.valid) {
        props.onChange(event.target.value);
      }
    }}
  />
);

// Represents a decimal number
export const Dec = (props) => (
  <span className={styles.decimal}>{props.children}</span>
);

const DecInput = (props) => (
  <Dec>
    <NumericInput pattern="[0-9]*" {...props} />
  </Dec>
);

// Represents a hex number
export const Hex = (props) => (
  <span className={styles.hexadecimal}>
    {props.children}
    <sup>&nbsp;hex</sup>
  </span>
);

const HexInput = (props) => (
  <Hex>
    <NumericInput inputMode="text" pattern="[0-9A-Fa-f]*" {...props} />
  </Hex>
);

// Represents an octal number
export const Oct = (props) => (
  <span className={styles.octal}>
    {props.children}
    <sup>&nbsp;oct</sup>
  </span>
);

const OctInput = (props) => (
  <Oct>
    <NumericInput pattern="[0-7]*" {...props} />
  </Oct>
);

// Represents a binary number
export const Bin = (props) => (
  <span className={styles.binary}>
    {props.children}
    <sup>&nbsp;bin</sup>
  </span>
);

const BinInput = (props) => (
  <Bin>
    <NumericInput size={6} pattern="[0-1]*" {...props} />
  </Bin>
);

export interface UtfPlaygroundProps {
  base: number;
}

export const UtfPlayground: React.FC<UtfPlaygroundProps> = (
  props: UtfPlaygroundProps
) => {
  const [text, setText] = useState("abcdefg");

  let Base;
  switch (props.base) {
    case 8:
      Base = Oct;
      break;
    case 2:
      Base = Bin;
      break;
    case 16:
      Base = Hex;
      break;
    default:
      Base = Dec;
      break;
  }

  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);

  return (
    <form className={styles.utfPlayground}>
      <div className="form-group mr-3">
        <textarea
          className={`form-control ${styles.textInput}`}
          onChange={(ev) => setText(ev.target.value)}
          value={text}
        />
      </div>
      <div className={styles.numbersEncoding}>
        <Base>{utf8.map(c => c.toString(props.base)).join(" ")}</Base>
      </div>
    </form>
  );
};

const DECIMAL_EXPONENTS = [
  "one",
  "ten",
  "hundred",
  "thousand",
  "ten thousand",
  "hundred thousand",
  "million",
  "ten million",
  "hundred million",
  "billion",
  "ten billion",
  "hundred billion",
  "trillion",
];
const OCTAL_EXPONENTS = [
  "one",
  "eight",
  "sixty four",
  "five hundred and twenty",
  "four thousand and ninety six",
  "thirty two thousand and sixty eight",
  "two hundred sixty two thousands and one hundred and forty four",
];
const BINARY_EXPONENTS = [
  "one",
  "two",
  "four",
  "eight",
  "sixteen",
  "thirty two",
  "sixty four",
  "one hundred and eight",
  "two hundreds and fifty six",
  "five hundreds and twelve",
  "one thousand and twenty four",
];
const HEX_EXPONENTS = [
  "one",
  "sixteen",
  "two hundred and fifty six",
  "four thousand and ninety six",
  "sixty five thousand five hundred thirty six",
];

interface ExponentationProps {
  exp: number;
  radix: number;
  num: number;
  expDescription: Array<string>;
}

export const Exponentiation: React.FC<ExponentationProps> = ({
  exp,
  radix,
  expDescription,
  num,
}: ExponentationProps) => {
  const pow = Math.pow(radix, exp);
  const expDesc = expDescription[exp];
  if (typeof expDesc === "undefined") {
    return null;
  }
  const plural =
    num == 0 || num > 1
      ? expDesc[expDesc.length - 1] == "x"
        ? "es"
        : "s"
      : "";
  return (
    <li key={exp}>
      <Dec>
        <abbr title={pow.toString(10)}>
          {radix}
          <sup>{exp}</sup>
        </abbr>
      </Dec>{" "}
      × {num} = <Dec>{num * pow}</Dec>{" "}
      <em>
        ({num} {expDesc + plural})
      </em>
    </li>
  );
};

export const BinaryPlayground: React.FC = () => {
  const [number, setNumber] = useState(11);
  const digits = [];

  let divNum = number;
  while (divNum > 0) {
    digits.push(divNum % 2);
    divNum = Math.floor(divNum / 2);
  }

  const digitsNum = digits.length - 1;

  return (
    <>
      <p>
        <span>
          The same thing happens if we use <Dec>2</Dec> as our number base. For
          example, let&apos;s take a number&nbsp;
        </span>
        <BinInput
          value={number.toString(2)}
          onChange={(value) => setNumber(parseInt(value, 2))}
        />
        <span>
          . It can be deconstructed as a sum of the following exponents:
        </span>
      </p>
      <ul className={styles.exponents}>
        {digits.reverse().map((num, exp) => (
          <Exponentiation
            key={exp}
            radix={2}
            exp={digitsNum - exp}
            num={num}
            expDescription={BINARY_EXPONENTS}
          />
        ))}
      </ul>
      <p>
        <span>If we sum all these exponents, we will get&nbsp;</span>
        <em>
          <DecInput
            value={number.toString(10)}
            onChange={(value) => setNumber(parseInt(value, 10))}
          />
        </em>
        <span>
          , which is the number that is represented as{" "}
          <Bin>{number.toString(2)}</Bin> in the binary form.
        </span>
      </p>
    </>
  );
};

export const DecimalPlayground: React.FC = (props) => {
  const [number, setNumber] = useState(123);
  const digits = [];

  let divNum = number;
  while (divNum > 0) {
    digits.push(divNum % 10);
    divNum = Math.floor(divNum / 10);
  }

  const digitsNum = digits.length - 1;

  const exponentSumNumbers = digits
    .reverse()
    .map((num, exp) => num * Math.pow(10, digitsNum - exp));

  let summation;
  if (exponentSumNumbers.length > 0) {
    summation = (
      <span>
        . It can be deconstructed as a sum of numbers&nbsp;(
        {exponentSumNumbers
          .map<React.ReactNode>((num) => <Dec key={num}>{num}</Dec>)
          .reduce((prev, num) => [prev, " + ", num])}
        ), or as a sum of{" "}
        <a href="https://www.khanacademy.org/math/pre-algebra/pre-algebra-exponents-radicals">
          <em>exponents</em>
        </a>
        :
      </span>
    );
  } else {
    summation = <span>.</span>;
  }

  return (
    <>
      <p>
        <span>{props.children}</span>
        <DecInput
          value={number.toString(10)}
          onChange={(value) => setNumber(parseInt(value, 10))}
        />
        {summation}
      </p>
      <ul className={styles.exponents}>
        {digits.map((num, exp) => (
          <Exponentiation
            key={exp}
            radix={10}
            exp={digitsNum - exp}
            num={num}
            expDescription={DECIMAL_EXPONENTS}
          />
        ))}
      </ul>
    </>
  );
};

export const OctalPlayground: React.FC = () => {
  const [number, setNumber] = useState(0o777);
  const digits = [];

  let divNum = number;
  while (divNum > 0) {
    digits.push(divNum % 8);
    divNum = Math.floor(divNum / 8);
  }

  const digitsNum = digits.length - 1;

  digits.reverse();

  const exponentSumNumbers = digits.map(
    (num, exp) => num * Math.pow(8, digitsNum - exp)
  );

  let summation;

  if (exponentSumNumbers.length > 0) {
    summation = (
      <p key="p2">
        If we sum the numbers{" "}
        {exponentSumNumbers
          .map<React.ReactNode>((num) => <Dec key={num}>{num}</Dec>)
          .reduce((prev, num) => [prev, " + ", num])}
        , we'll get&nbsp;
        <em>
          <DecInput
            value={number.toString(10)}
            onChange={(value) => setNumber(parseInt(value, 10))}
          />
        </em>
        , which is exactly what the octal number <Oct>{number.toString(8)}</Oct>{" "}
        is if we convert it into a decimal number!
      </p>
    );
  } else {
    summation = (
      <p key="p2">
        If you enter an octal number above, you will see how it can be
        deconstructed as a sum of exponents.
      </p>
    );
  }

  return (
    <>
      <p key="p1">
        <OctInput
          value={number.toString(8)}
          onChange={(value) => setNumber(parseInt(value, 8))}
        />
        {exponentSumNumbers.length > 0 ? (
          <span>&nbsp;is a sum of exponents:</span>
        ) : null}
      </p>
      <ul className={styles.exponents}>
        {digits.map((num, exp) => (
          <Exponentiation
            key={exp}
            radix={8}
            exp={digitsNum - exp}
            num={num}
            expDescription={OCTAL_EXPONENTS}
          />
        ))}
      </ul>
      {summation}
    </>
  );
};

export const HexPlayground: React.FC = () => {
  const [number, setNumber] = useState(0x1f);
  const digits = [];

  let divNum = number;
  while (divNum > 0) {
    digits.push(divNum % 16);
    divNum = Math.floor(divNum / 16);
  }

  const digitsNum = digits.length - 1;

  digits.reverse();

  const exponentSumNumbers = digits.map(
    (num, exp) => num * Math.pow(16, digitsNum - exp)
  );

  let summation;

  if (exponentSumNumbers.length > 0) {
    summation = (
      <p key="p2">
        If we sum the numbers{" "}
        {exponentSumNumbers
          .map<React.ReactNode>((num) => <Dec key={num}>{num}</Dec>)
          .reduce((prev, num) => [prev, " + ", num])}
        , we'll get the decimal number&nbsp;
        <em>
          <DecInput
            value={number.toString(10)}
            onChange={(value) => setNumber(parseInt(value, 10))}
          />
        </em>
        , which corresponds to <Hex>{number.toString(16)}</Hex>.
      </p>
    );
  } else {
    summation = (
      <p key="p2">
        If you enter a hexedecimal number above, you will see how it can be
        deconstructed as a sum of exponents.
      </p>
    );
  }

  return (
    <>
      <p key="p1">
        <span>Give it a try:</span>
        <HexInput
          value={number.toString(16)}
          onChange={(value) => setNumber(parseInt(value, 16))}
        />
      </p>
      <ul className={styles.exponents}>
        {digits.map((num, exp) => (
          <Exponentiation
            key={exp}
            radix={16}
            exp={digitsNum - exp}
            num={num}
            expDescription={HEX_EXPONENTS}
          />
        ))}
      </ul>
      {summation}
    </>
  );
};
