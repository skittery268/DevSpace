"use client";

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import * as orderService from "@/services/order.service";
import type { Paginated } from "@/types/api.types";
import type { Order, SettableOrderStatus } from "@/types/order.types";

export function useMyOrders(page: number, limit = DEFAULT_PAGE_SIZE) {
    return useQuery<Paginated<Order>, ApiError>({
        queryKey: queryKeys.orders.mine({ page, limit }),
        queryFn: () => orderService.getMyOrders({ page, limit }),
        placeholderData: keepPreviousData,
    });
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: orderService.deleteOrder,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
    });
}

/** `PATCH /order/:orderId` — admin only, and only on orders they can see. */
export function useChangeOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation<
        Order,
        ApiError,
        { orderId: string; status: SettableOrderStatus }
    >({
        mutationFn: ({ orderId, status }) =>
            orderService.changeOrderStatus(orderId, status),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        },
    });
}
