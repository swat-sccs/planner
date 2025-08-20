"use client";

import { Input } from "@nextui-org/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@nextui-org/drawer";
import SearchIcon from "@mui/icons-material/Search";
import { useCookies } from "next-client-cookies";
import { Button, useDisclosure } from "@nextui-org/react";

export default function Search(props: any) {
  const searchParams = useSearchParams();
  const cookies = useCookies();
  const [selectedTerm, setSelectedTerm]: any = useState([]);

  const [search, setSearch]: any = useState();
  const pathname = usePathname();
  const { replace } = useRouter();

  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSearch = useDebouncedCallback((term: string) => {
    const filtered_term = term.replace(/[^a-zA-Z0-9 ]+/gi, "");
    const include_colons = term.replace(/[^a-zA-Z0-9: ]+/gi, "");

    if (term) {
      //decodeURIComponent;
      if (pathname === "/") {
        params.set("query", filtered_term);
        cookies.set("searchTermCookie", filtered_term);
      }
      if (pathname === "/profs") {
        params.set("prof", filtered_term);
        cookies.set("profCookie", filtered_term);
      }
    } else {
      if (pathname === "/") {
        params.delete("query");
        cookies.set("searchTermCookie", "");
      }
      if (pathname === "/profs") {
        params.delete("prof");
        cookies.remove("profCookie");
      }
    }
    replace(`${pathname}?${params.toString()}`);
  }, 700);

  const firstLoad = async () => {
    if (pathname === "/") {
      let termCookie = cookies.get("termCookie");
      if (!termCookie) {
        //cookies.set("termCookie", "S2025");
        //params.set("term", "S2025");
        replace(`${pathname}?${params.toString()}`);
        setSelectedTerm(searchParams.get("term")?.toString().split(","));
      } else {
        let searchTermCookie = cookies.get("searchTermCookie");
        if (searchTermCookie) {
          params.set("query", searchTermCookie);
        }
        params.set("term", termCookie);
        await window;
        replace(`${pathname}?${params.toString()}`);
        //setSelectedTerm(searchParams.get("term")?.toString().split(","));
        setSearch(searchTermCookie);
      }
    }
    if (pathname === "/profs") {
      if (searchParams.get("query")?.toString()) {
        params.delete("query");
      }
      let profCookie = cookies.get("profCookie");
      if (!profCookie) {
        setSearch("");
        //params.set("prof", "S2025");
        //replace(`${pathname}?${params.toString()}`);
        //setSelectedProf(searchParams.get("prof")?.toString().split(","));
      } else {
        params.set("prof", profCookie);
        replace(`${pathname}?${params.toString()}`);
        //setSelectedProf(searchParams.get("prof")?.toString().split(","));
        setSearch(profCookie);
      }
    }
  };

  function resetFilters() {
    params.delete("dotw");
    params.delete("stime");
    replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    // Update the document title using the browser API
    firstLoad();
  }, []);

  return (
    <div className="w-full" key={"search"}>
      <Input
        size={"lg"}
        className="text-[18px]"
        endContent={
          <>
            <div className="bg-default/60 lg:hidden flex w-12 col-span-1 h-12 justify-center -mr-1  cursor-pointer hover:opacity-85">
              <FilterListIcon
                color="inherit"
                className="align-middle mt-auto mb-auto flex text-black dark:text-white"
                onClick={onOpen}
              />

              <Drawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={"bottom"}
                hideCloseButton
                size="3xl"
              >
                <DrawerContent>
                  {(onClose: any) => (
                    <>
                      <DrawerHeader className="flex flex-col gap-1">
                        Filter
                      </DrawerHeader>
                      <DrawerBody>{props.filters}</DrawerBody>
                      <DrawerFooter>
                        <Button
                          onPress={resetFilters}
                          color="danger"
                          variant="flat"
                        >
                          Reset
                        </Button>
                        <Button
                          color="primary"
                          variant="flat"
                          onPress={onClose}
                        >
                          Filter
                        </Button>
                      </DrawerFooter>
                    </>
                  )}
                </DrawerContent>
              </Drawer>
            </div>

            <div className="bg-default/60 w-12 col-span-1 flex h-12 justify-center rounded-e-xl cursor-pointer hover:opacity-85">
              <SearchIcon className="align-middle mt-auto mb-auto flex text-black dark:text-white" />
            </div>
          </>
        }
        placeholder={"Search"}
        //placeholder="Search"
        onValueChange={setSearch}
        value={search}
        classNames={{
          label: "text-black/50 dark:text-white/90",
          input: [
            "bg-transparent",
            "text-black/90 dark:text-white/90",
            "placeholder:text-foreground dark:placeholder:text-white/60",
          ],
          innerWrapper: "bg-transparent, pl-4",
          inputWrapper: [
            "shadow-xl",
            "bg-light_foreground",
            "dark:bg-default/60",
            "backdrop-blur-xl",
            "backdrop-saturate-200",
            "dark:hover:bg-default/70",
            "dark:group-data-[focus=true]:bg-default/60",
            "!cursor-text",
            "px-0",
          ],
        }}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
