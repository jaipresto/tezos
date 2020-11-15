export interface State {
    displayListLength: boolean;
    displayRowId: boolean;
    orderBy: {
        field: 'xtz' | 'date';
        direction: 'asc' | 'desc';
    };
    receiver: string;
    rowsToDisplay: number;
    error?: CustomError | null;
};

const ERROR_CODE = [
    'transactions-fetch-failure'
] as const;

export type CustomErrorCode = typeof ERROR_CODE[number];

export interface CustomError  {
    code: CustomErrorCode;
    message: string;
    details?: any;
}

export type ExampleTransactionsResponse = [
    ExampleTransactionRaw['row_id'],
    ExampleTransactionRaw['time'],
    ExampleTransactionRaw['type'],
    ExampleTransactionRaw['sender'],
    ExampleTransactionRaw['volume']
];

/**
 * Transaction as delivered from API.
 */
export interface ExampleTransactionRaw {
    time: number;
    row_id: number;
    sender: string;
    volume: number;
    type: string;
}

/**
 * Transformed transaction.
 */
export interface ExampleTransaction {
    date: number;
    dateFormatted: string;
    rowId: number;
    senderAddress: string;
    senderAddressFormatted: string;
    xtz: number;
    dollars: string;
}

/**
 * Market Ticket object as delivered from API.
 */
export interface MarketTickerRaw {
    pair: string;
    base: string;
    quote: string;
    exchange: string;
    open: number;
    high: number;
    low: number;
    last: number;
    change: number;
    vwap: number;
    n_trades: number;
    volume_base: number;
    volume_quote: number;
    timestamp: string;
}

/**
 * Transformed Market Ticket object.
 */
export interface MarketTicker {
    pair: string;
    base: string;
    quote: string;
    exchange: string;
    open: number;
    high: number;
    low: number;
    last: number;
    change: number;
    vwap: number;
    nTrades: number;
    volumeBase: number;
    volumeQuote: number;
    timestamp: string;
}