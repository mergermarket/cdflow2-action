import process from "process"
import fs from "fs"
import {addPath, debug, getBooleanInput, getInput, setFailed} from "@actions/core"
import {downloadTool} from "@actions/tool-cache"
import {exec} from "@actions/exec"
import {mv} from "@actions/io";

function cdflowArch(): string {
    switch (process.arch) {
        case "x64":
            return "amd64"
        default:
            return process.arch
    }
}

function fetchAppVersion(): string {
    const configured = getInput("appVersion")
    if (configured !== "") return configured

    return `${process.env.GITHUB_WORKFLOW}-${process.env.GITHUB_RUN_NUMBER}-${process.env.GITHUB_SHA}`
}

async function main() {
    const cdflowVersion = getInput("version")

    const cdflowPath = await downloadTool(`https://github.com/mergermarket/cdflow2/releases/${cdflowVersion}/download/cdflow2-${process.platform}-${cdflowArch()}`)
    await fs.promises.chmod(cdflowPath, 0o775)

    const cdflowPathDir = cdflowPath + "_dir"
    const cdflow2Leafname = process.platform === "win32" ? "cdflow2.exe" : "cdflow2"
    const cdflow2Exe = cdflowPathDir + "/" + cdflow2Leafname
    await mv(cdflowPath, cdflow2Exe)
    addPath(cdflowPathDir)

    const cdflowCommand = getInput("command")
    if (cdflowCommand === "") return

    const cdflowEnvironment: Record<string, string> = {}
    for (const [name, value] of Object.entries(process.env)) {
        if (value !== undefined) {
            cdflowEnvironment[name] = value
        }
    }

    const args = [cdflowCommand]

    if (cdflowCommand === "deploy" && getBooleanInput("newState")) {
        args.push("--new-state")
    }

    if (cdflowCommand === "deploy" || cdflowCommand === "destroy" || cdflowCommand === "shell") {
        args.push(getInput("environment"))
    }

    if (cdflowCommand === "release" || cdflowCommand === "deploy" || cdflowCommand === "destroy") {
        const appVersion = fetchAppVersion()
        args.push(appVersion)
        cdflowEnvironment.JOB_NAME = appVersion
    }

    if (cdflowCommand === "shell") {
        args.push(...getInput("shellArgs").split(/\s+/))
    }

    debug(`cdflow command: ${JSON.stringify(args)}`)

    await exec("cdflow2", args, {
        env: cdflowEnvironment
    })
}

main().then(
    () => {
    },
    err => {
        console.error("Fatal error", err)
        setFailed(err)
    }
)
