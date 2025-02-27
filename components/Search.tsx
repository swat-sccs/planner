"use client";

import { Input } from "@nextui-org/input";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { useCallback, useEffect, useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { useCookies } from "next-client-cookies";

export default function Search(props: any) {
  const router = useRouter();
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

  const handleSearch = useDebouncedCallback((term: string) => {
    const filtered_term = term.replace(/[^a-zA-Z0-9 ]+/gi, "");
    const include_colons = term.replace(/[^a-zA-Z0-9: ]+/gi, "");
    const term_list = include_colons.split(" ");

    if (term) {
      //decodeURIComponent;
      params.set("query", filtered_term);
      cookies.set("searchTermCookie", filtered_term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 800);

  const firstLoad = useCallback(async () => {
    if (pathname == "/") {
      let termCookie = cookies.get("termCookie");
      if (!termCookie) {
        cookies.set("termCookie", "S2025");
        params.set("term", "S2025");
        replace(`${pathname}?${params.toString()}`);
        setSelectedTerm(searchParams.get("term")?.toString().split(","));
      } else {
        params.set("term", termCookie);
        replace(`${pathname}?${params.toString()}`);
        setSelectedTerm(searchParams.get("term")?.toString().split(","));
      }
    }
  }, []);

  useEffect(() => {
    // Update the document title using the browser API
    firstLoad();
  }, [firstLoad]);

  return (
    <div className="w-full">
      <Input
        size={"lg"}
        className="text-[16px]"
        endContent={
          <div className="bg-slate-400 dark:bg-slate-800 w-12 col-span-1 flex h-12 justify-center -mr-5 rounded-e-xl ">
            <SearchIcon
              color="inherit"
              className="align-middle mt-auto mb-auto flex  "
            />
          </div>
        }
        defaultValue={searchParams.get("query")?.toString()}
        placeholder="Search"
        value={search}
        classNames={{
          label: "text-black/50 dark:text-white/90",
          input: [
            "bg-transparent",
            "text-black/90 dark:text-white/90",
            "placeholder:text-foreground dark:placeholder:text-white/60",
          ],
          innerWrapper: "bg-transparent",
          inputWrapper: [
            "shadow-xl",
            "bg-light_foreground",
            "dark:bg-default/60",
            "backdrop-blur-xl",
            "backdrop-saturate-200",
            "dark:hover:bg-default/70",

            "dark:group-data-[focus=true]:bg-default/60",
            "!cursor-text",
          ],
        }}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
