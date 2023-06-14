import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { SpeakerWaveIcon as VolumeIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { selectAudio, setVolume } from "@/lib/slices/audioSlice";

export default function VolumeButton() {
  const { volume } = useSelector(selectAudio);
  const dispatch = useDispatch();
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    dispatch(setVolume(v));
  };
  return (
    <Menu as="div" className="relative hidden sm:block">
      <div className="flex items-center">
        <Menu.Button className=" w-full justify-center rounded-md ">
          <VolumeIcon className="h-5 w-5 text-neutral-content hover:text-primary-400" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-[15rem] right-7 mt-2 w-56 origin-top-right -rotate-90 divide-y rounded-md bg-base-300 shadow-lg ">
          <div className="px-1 py-1 ">
            <label className={`mx-1  items-center text-xs `}>
              {/* {label} */}
              <input
                aria-orientation="vertical"
                className="
					range
                    range-primary
					range-xs
					ml-2
					h-3
					w-48
					p-0"
                type="range"
                max={1}
                value={volume}
                step={"any"}
                onChange={handleVolumeChange}
              />
            </label>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
