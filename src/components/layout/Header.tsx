import Image from 'next/image';
import Badge from '../common/Badge';
import { Option } from '@/constants';

const Header = ({ title, subtitle, siren, badge, badgeName }: { badgeName?: string, title?: string, badge?: Option, subtitle?: string, siren?: string }) => {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-blue-950 w-24 h-24 flex items-center justify-center mr-2">
          <Image src="/entreprise.png" alt="User" width={40} height={40} />
        </div>
        <div className='flex flex-col'>
          <h2 className="text-3xl font-medium">{title}</h2>
          <p className='text-stone-400'>SIREN : {siren}</p>
          {badge?.label && <div className='w-1/2 mt-1'>
            <Badge
              label={badge?.label}
              color={badge?.color}
              icon={badge?.icon ? <badge.icon /> : null}
            />
          </div>}
          {badgeName && <div className='w-1/2 mt-1'>
            <Badge
              label={badgeName}
              color={"blue"}
              icon={null}
            />
          </div>}
        </div>
      </div>
      {subtitle && <h3 className="text-2xl font-medium mt-5">{subtitle}</h3>}
    </div>
  );
};

export default Header;
