import Image from 'next/image';
import Badge from '../common/Badge';

const Header = ({ title, subtitle, siren, badgeName }: { title?: string, badgeName?: string, subtitle?: string, siren?: string }) => {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-blue-950 w-24 h-24 flex items-center justify-center mr-2">
          <Image src="/entreprise.png" alt="User" width={40} height={40} />
        </div>
        <div className='flex flex-col'>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className='text-stone-400'>SIREN : {siren}</p>
          {badgeName && <div className='w-1/2 mt-1'>
            <Badge
              label={badgeName}
              color={"blue"}
            />
          </div>}
        </div>
      </div>
      {subtitle && <h3 className="text-2xl font-bold mt-5">{subtitle}</h3>}
    </div>
  );
};

export default Header;
