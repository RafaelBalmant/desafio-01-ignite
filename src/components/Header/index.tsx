import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';

export default function Header(): ReactElement {
  return (
    <Link href="/">
      <Image src="/logo.svg" width="200" height="25" alt="logo" />
    </Link>
  );
}
