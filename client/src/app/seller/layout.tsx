import { RequireRole } from "@/components/common/RouteGuard";

/**
 * Product writes are behind `allowedTo("seller", "admin")` at the router level,
 * so anyone else would only reach a 403.
 */
export default function SellerLayout({ children }: LayoutProps<"/seller">) {
    return <RequireRole roles={["seller", "admin"]}>{children}</RequireRole>;
}
