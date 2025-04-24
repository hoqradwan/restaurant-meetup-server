import { Menu } from "./menu.model";

export const createMenuIntoDB = async (menuData: any) => {
    const menu = await Menu.create(menuData);
    return menu;
}