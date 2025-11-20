import React, { createContext, useState, useContext } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const showLoading = (msg = "Loading...") => {
        setMessage(msg);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        setMessage("");
    };

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
            {children}
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 99999,
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            background: "white",
                            padding: "48px",
                            borderRadius: "12px",
                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                            minWidth: "240px",
                        }}
                    >
                        <Spin
                            indicator={
                                <LoadingOutlined
                                    style={{
                                        fontSize: 48,
                                        color: "#1890ff",
                                    }}
                                />
                            }
                        />
                        {message && (
                            <p
                                style={{
                                    marginTop: "20px",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    color: "#262626",
                                }}
                            >
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};
