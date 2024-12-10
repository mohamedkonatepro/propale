import Image from 'next/image';
import React from 'react';

const LoginHeader = () => {
  return (
    <div className="flex items-center mb-6">
      <Image src="/logo.svg" alt="Propale" width={68} height={68} className="mr-2" />
      <h2 className="text-3xl font-semibold">Propale</h2>
    </div>
  );
};

export default LoginHeader;
