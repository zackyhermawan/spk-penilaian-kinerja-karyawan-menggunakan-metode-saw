import Swal from "sweetalert2"

export const alertSuccess = (message: any) => {
    return Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: message,
        timer: 1000,
        showConfirmButton: false,
        showCancelButton: false
    })
}

export const alertError = (message: any) => {
    return Swal.fire({
        icon: "error",
        title: "Gagal",
        text: message
    })
}

export const alertConfirm = (message: any, onConfirm: ()=>Promise<any>) => {
    return Swal.fire({
        title: "Konfirmasi",
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        preConfirm: async()=>{

            try{

                await onConfirm()

            }catch(err:any){

                Swal.showValidationMessage(
                    err.response?.data?.message ||
                    "Terjadi kesalahan"
                )

                return false
            }

        },

        allowOutsideClick: ()=> !Swal.isLoading()
    })
}