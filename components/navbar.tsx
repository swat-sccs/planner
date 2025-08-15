"use client";
//Just for pathname highlighting though, could always go back if it becomes too slow
import React, { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Link } from "@nextui-org/link";
import Search from "../components/Search";

import { usePathname } from "next/navigation";
import { useCookies } from "next-client-cookies";
import InputIcon from "@mui/icons-material/Input";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";

import { siteConfig } from "../config/site";
import { ThemeSwitch } from "../components/theme-switch";
import { Button } from "@nextui-org/button";
import Logo from "../public/logo.svg";

export const Navbar = (props: any) => {
  const cookies = useCookies();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "all",
    });
  }
  function run() {
    console.log("HELLO");
  }
  useEffect(() => {
    setIsMenuOpen(false); // Close the navigation panel
  }, [pathname]);

  if (status === "authenticated") {
    axios
      .post("/api/user", {
        session: session,
      })
      .then((response) => {
        //console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="bg-background_navbar h-auto">
      <NextUINavbar
        classNames={{
          toggleIcon: ["text-primary"],
        }}
        className="bg-inherit lg:py-1"
        maxWidth="full"
        position="sticky"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent className="lg:basis-full ">
          <NavbarBrand as="div" className="gap-2 lg:max-w-fit lg:mr-5 max-w-10">
            <Link
              className="flex justify-start items-center "
              href="/"
              onPress={() => {
                cookies.set("pagePref", "/");
                //console.log(pathname);
              }}
            >
              <div>
                <Logo className="h-9 lg:h-12" />
              </div>
            </Link>
          </NavbarBrand>

          <NavbarContent className="gap-4 flex-row hidden lg:flex">
            {siteConfig.navItems.map((item) => (
              <NavbarItem isActive={pathname === item.href} key={item.href}>
                <Link
                  key={item.href}
                  color={pathname === item.href ? "secondary" : "foreground"}
                  className="text-lg dark cursor-pointer"
                  onPress={() => {
                    cookies.set("pagePref", item.href);
                    if (pathname != item.href) {
                      router.push(item.href);
                    }
                  }}
                  //href={item.href}
                >
                  {item.label}
                </Link>
              </NavbarItem>
            ))}
            {/*
            {session?.user.role == "admin" ? (
              <NavbarMenuItem isActive={pathname === "/admin"} key={"/admin"}>
                <Link
                  key={"/admin"}
                  color={pathname === "/admin" ? "secondary" : "foreground"}
                  className="text-lg dark"
                  onPress={() => {
                    cookies.set("pagePref", "/admin");
                  }}
                  href={"/admin"}
                >
                  Admin
                </Link>
              </NavbarMenuItem>
            ) : null}
             */}
          </NavbarContent>
        </NavbarContent>
        {pathname === "/" || pathname === "/profs" ? (
          <NavbarContent className="lg:basis-full lg:flex hidden lg:w-full">
            <Search />
          </NavbarContent>
        ) : null}

        <NavbarContent
          className="hidden lg:flex basis-1/5 lg:basis-full"
          justify="end"
        >
          <NavbarItem>
            {status === "authenticated" ? (
              <Dropdown
                classNames={{
                  content:
                    "py-1 px-1 border border-default-200 bg-light_foreground",
                }}
              >
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="text-primary border-primary"
                    size={"md"}
                  >
                    <AccountCircleIcon className="text-primary " />
                    <div className="font-medium ">
                      {session.user?.name || "Account"}
                    </div>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Sign out button">
                  {/* Causes an awful error if rendered conditionally */}
                  {/* I dont see an error anymore so trying again*/}

                  {session.user?.role == "admin" ? (
                    <DropdownItem
                      className="text-center "
                      key="admin"
                      href="/admin"
                    >
                      Admin
                    </DropdownItem>
                  ) : null}

                  <DropdownItem
                    className="text-center "
                    key="myRatings"
                    onPress={() => router.push("/myratings")}
                  >
                    My Ratings
                  </DropdownItem>
                  <DropdownItem
                    className="text-center "
                    key="signOut"
                    onPress={() => signOut()}
                  >
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                variant="bordered"
                onPress={() => signIn("keycloak", { callbackUrl: "/" })}
                className="border-primary text-primary"
              >
                <InputIcon /> Log In
              </Button>
            )}
          </NavbarItem>
          <NavbarItem className="hidden lg:flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>

        {/* Mobile?*/}

        <NavbarContent className="flex lg:hidden" justify="end">
          <ThemeSwitch />

          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        </NavbarContent>
        <NavbarMenu className="lg:flex">
          <div className="mx-4 mt-5 flex flex-col  text-center text-6xl">
            {siteConfig.navItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  key={item.href}
                  color={pathname === item.href ? "secondary" : "foreground"}
                  className="text-lg w-full"
                  onPress={() => {
                    cookies.set("pagePref", item.href);
                  }}
                  href={item.href}
                  size="lg"
                >
                  <div className="text-4xl">{item.label}</div>
                </Link>
              </NavbarMenuItem>
            ))}

            {/*
            {session?.user.role == "admin" ? (
              <NavbarMenuItem isActive={pathname === "/admin"} key={"/admin"}>
                <Link
                  key={"/admin"}
                  color={pathname === "/admin" ? "secondary" : "foreground"}
                  className="text-lg dark w-full"
                  onPress={() => {
                    cookies.set("pagePref", "/admin");
                  }}
                  href={"/admin"}
                  size="lg"
                >
                  <div className="text-4xl">Admin</div>
                </Link>
              </NavbarMenuItem>
            ) : null}
             */}
          </div>
          <NavbarItem className="justify-center text-center">
            {status === "authenticated" ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="text-black border-black dark:text-primary dark:border-primary"
                  >
                    <AccountCircleIcon />
                    {session.user?.name || "Account"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Signout dropdown">
                  {/* Causes an awful error if rendered conditionally */}
                  {session.user?.role == "admin" ? (
                    <DropdownItem
                      className="text-center "
                      key="admin"
                      href="/admin"
                    >
                      Admin
                    </DropdownItem>
                  ) : null}
                  <DropdownItem
                    className="text-center "
                    key="myRatings"
                    onPress={() => router.push("/myratings")}
                  >
                    My Ratings
                  </DropdownItem>
                  <DropdownItem
                    key="signOut"
                    onPress={() => signOut()}
                    className="text-center"
                  >
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Button
                type="button"
                variant="bordered"
                className="text-black border-black dark:text-primary dark:border-primary"
                onPress={() => signIn("keycloak", { callbackUrl: "/" })}
              >
                <InputIcon /> Log In
              </Button>
            )}
          </NavbarItem>
        </NavbarMenu>
      </NextUINavbar>
    </div>
  );
};
