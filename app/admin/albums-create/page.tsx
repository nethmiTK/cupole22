import { redirect } from "next/navigation";

export default function AlbumsCreatePage() {
  redirect("/admin/albums-create/categories");
}
