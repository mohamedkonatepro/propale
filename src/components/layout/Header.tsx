import Image from 'next/image';

const Header = ({ title, subtitle, siren }: { title: string, subtitle: string, siren: string}) => {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center mb-6">
        <Image src="/logo.svg" alt="Propale" width={68} height={68} className="mr-2" />
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
