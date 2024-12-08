import { format } from "date-fns";
import { Button } from "@/components/common/Button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

export const DateRangePicker: React.FC<{
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="flex flex-col justify-center items-center md:flex-row gap-4">
      {/* Start Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {startDate ? format(startDate, "dd/MM/yyyy") : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              selected={startDate}
              onSelect={onStartDateChange}
              mode="single"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {endDate ? format(endDate, "dd/MM/yyyy") : "Sélectionner une date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              selected={endDate}
              onSelect={onEndDateChange}
              mode="single"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
