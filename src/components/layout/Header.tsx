import Image from 'next/image';

const Header = ({ title, subtitle, siren }: { title?: string, subtitle: string, siren?: string }) => {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-blue-950 w-24 h-24 flex items-center justify-center mr-2">
          <Image src="/entreprise.png" alt="User" width={40} height={40} />
        </div>
        <div className='flex flex-col'>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className='text-stone-400'>SIREN : {siren}</p>
        </div>
      </div>
      <h3 className="text-2xl font-bold mt-5">{subtitle}</h3>
    </div>
  );
};

export default Header;
