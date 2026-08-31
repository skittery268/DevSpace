"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/common/States";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useCartHydrated } from "@/features/cart/useCart";
import { useCheckout } from "@/features/checkout/useCheckout";
import { useFormat } from "@/i18n/useFormat";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createShippingSchema,
    type ShippingValues,
} from "@/lib/validation/checkout.schemas";
import { selectItemCount, selectSubtotal, useCartStore } from "@/store/cart.store";

const SHIPPING_FIELDS = [
    "fullname",
    "email",
    "country",
    "city",
    "address",
    "zipcode",
    "phone",
] as const;

export function CheckoutView() {
    const { t } = useTranslation();
    const format = useFormat();
    const hydrated = useCartHydrated();
    const items = useCartStore((state) => state.items);
    const subtotal = useCartStore(selectSubtotal);
    const itemCount = useCartStore(selectItemCount);
    const { user } = useAuth();
    const checkout = useCheckout();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ShippingValues>({
        resolver: zodResolver(useMemo(() => createShippingSchema(t), [t])),
        defaultValues: {
            fullname: user?.fullname ?? "",
            email: user?.email ?? "",
            country: "",
            city: "",
            address: "",
            zipcode: "",
            phone: "",
        },
    });

    const onSubmit = handleSubmit(async (userInfo) => {
        setFormError(null);

        try {
            // Only ids and quantities are sent: the server prices the order itself.
            await checkout.mutateAsync({
                userOrder: items.map((item) => ({
                    id: item.productId,
                    quantity: item.quantity,
                })),
                userInfo,
            });
            // On success the mutation navigates the browser to Stripe, so nothing
            // after this line runs.
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, [...SHIPPING_FIELDS]));
        }
    });

    if (!hydrated) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingCart className="size-6" />}
                title={t("checkout.emptyTitle")}
                description={t("checkout.emptyBody")}
                action={
                    <ButtonLink href="/products">{t("cart.browseProducts")}</ButtonLink>
                }
            />
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
            noValidate
        >
            <Card>
                <CardHeader
                    title={t("checkout.shippingDetails")}
                    description={t("checkout.shippingNote")}
                />
                <CardBody className="space-y-4">
                    {formError ? <Alert tone="error">{formError}</Alert> : null}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label={t("checkout.fullName")}
                            autoComplete="name"
                            wrapperClassName="sm:col-span-2"
                            error={errors.fullname?.message}
                            {...register("fullname")}
                        />
                        <Input
                            type="email"
                            label={t("checkout.email")}
                            autoComplete="email"
                            wrapperClassName="sm:col-span-2"
                            error={errors.email?.message}
                            {...register("email")}
                        />
                        <Input
                            label={t("checkout.country")}
                            autoComplete="country-name"
                            error={errors.country?.message}
                            {...register("country")}
                        />
                        <Input
                            label={t("checkout.city")}
                            autoComplete="address-level2"
                            error={errors.city?.message}
                            {...register("city")}
                        />
                        <Input
                            label={t("checkout.address")}
                            autoComplete="street-address"
                            wrapperClassName="sm:col-span-2"
                            error={errors.address?.message}
                            {...register("address")}
                        />
                        <Input
                            label={t("checkout.zipcode")}
                            autoComplete="postal-code"
                            error={errors.zipcode?.message}
                            {...register("zipcode")}
                        />
                        <Input
                            type="tel"
                            label={t("checkout.phone")}
                            autoComplete="tel"
                            error={errors.phone?.message}
                            {...register("phone")}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
                <CardHeader title={t("checkout.order")} />
                <CardBody className="space-y-3 text-sm">
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.productId} className="flex justify-between gap-3">
                                <span className="min-w-0 truncate text-ink-600">
                                    {item.quantity} × {item.title}
                                </span>
                                <span className="shrink-0 font-medium text-ink-900">
                                    {format.price(item.price * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-between border-t border-ink-200 pt-3 text-base">
                        <span className="font-semibold text-ink-900">
                            {t("count.items", { count: itemCount })}
                        </span>
                        <span className="font-semibold text-ink-900">
                            {format.price(subtotal)}
                        </span>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        loading={checkout.isPending}
                        className="mt-2"
                    >
                        <Lock className="size-4" />
                        {t("checkout.continueToStripe")}
                    </Button>

                    <p className="text-xs leading-relaxed text-ink-500">
                        {t("checkout.stripeNote")}
                    </p>
                </CardBody>
            </Card>
        </form>
    );
}
